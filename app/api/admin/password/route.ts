import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db';
import { requireAdminSession, adminAuthResponse } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) return adminAuthResponse();

  let body: { current_password?: string; new_password?: string; confirm_password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { current_password, new_password, confirm_password } = body;

  if (!current_password || !new_password || !confirm_password) {
    return NextResponse.json({ error: 'All password fields are required' }, { status: 400 });
  }

  if (new_password !== confirm_password) {
    return NextResponse.json({ error: 'New passwords do not match' }, { status: 400 });
  }

  if (new_password.length < 8) {
    return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 });
  }

  if (!/[A-Z]/.test(new_password) || !/[0-9]/.test(new_password) || !/[^A-Za-z0-9]/.test(new_password)) {
    return NextResponse.json({
      error: 'Password must contain at least one uppercase letter, one number, and one special character'
    }, { status: 400 });
  }

  const db = getDb();
  const admin = db.prepare('SELECT * FROM admins WHERE id = ?').get(session.adminId!) as {
    id: number;
    password_hash: string;
  } | undefined;

  if (!admin) {
    return NextResponse.json({ error: 'Admin account not found' }, { status: 404 });
  }

  const valid = await bcrypt.compare(current_password, admin.password_hash);
  if (!valid) {
    return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
  }

  const newHash = await bcrypt.hash(new_password, 12);
  db.prepare("UPDATE admins SET password_hash = ?, updated_at = datetime('now') WHERE id = ?").run(newHash, admin.id);

  // Audit log
  db.prepare(`
    INSERT INTO admin_audit_log (admin_id, action, details)
    VALUES (?, 'PASSWORD_CHANGED', 'Admin password was changed')
  `).run(session.adminId!);

  return NextResponse.json({ success: true });
}
