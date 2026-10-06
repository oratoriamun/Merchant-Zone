import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdminSession, adminAuthResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) return adminAuthResponse();

  const db = getDb();
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '50', 10);
  const offset = (page - 1) * limit;

  const logs = db.prepare(`
    SELECT l.*, a.username as admin_username
    FROM admin_audit_log l
    LEFT JOIN admins a ON l.admin_id = a.id
    ORDER BY l.created_at DESC
    LIMIT ? OFFSET ?
  `).all(limit, offset);

  const total = (db.prepare('SELECT COUNT(*) as c FROM admin_audit_log').get() as { c: number }).c;

  return NextResponse.json({ logs, total, page, limit });
}
