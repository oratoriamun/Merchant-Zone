import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db';
import { getSession, checkRateLimit, recordFailedAttempt, clearLoginAttempts, getClientIp } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  // Rate limiting check
  const rateCheck = checkRateLimit(ip);
  if (!rateCheck.allowed) {
    const mins = Math.ceil((rateCheck.remainingMs || 0) / 60000);
    return NextResponse.json(
      { error: `Too many login attempts. Please try again in ${mins} minute(s).` },
      { status: 429 }
    );
  }

  let body: { username?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { username, password } = body;

  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
  }

  const db = getDb();
  const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username) as {
    id: number;
    username: string;
    password_hash: string;
  } | undefined;

  if (!admin) {
    recordFailedAttempt(ip);
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, admin.password_hash);
  if (!valid) {
    recordFailedAttempt(ip);
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  clearLoginAttempts(ip);

  const session = await getSession();
  session.adminId = admin.id;
  session.adminUsername = admin.username;
  session.isLoggedIn = true;
  await session.save();

  return NextResponse.json({ success: true, username: admin.username });
}
