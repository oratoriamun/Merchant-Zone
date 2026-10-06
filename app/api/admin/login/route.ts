import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db';
import { getSession, checkRateLimit, recordFailedAttempt, clearLoginAttempts, getClientIp } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
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

    const envUsername = process.env.ADMIN_USERNAME || 'admin';
    const envPassword = process.env.ADMIN_INITIAL_PASSWORD || 'Rocky@22';

    let dbAdmin: { id: number; username: string; password_hash: string } | null = null;
    try {
      const db = getDb();
      const row = db.prepare('SELECT id, username, password_hash FROM admins WHERE username = ?').get(username);
      if (row) {
        dbAdmin = row as { id: number; username: string; password_hash: string };
      }
    } catch (err) {
      console.warn('DB check during login bypassed (running in serverless or uninitialized DB):', err);
    }

    let isAuthenticated = false;
    let adminId = 1;
    let adminUsername = username;

    // 1. Check against environment variables (direct server-side credential verification)
    if (envPassword && username === envUsername && password === envPassword) {
      isAuthenticated = true;
      adminId = dbAdmin?.id || 1;
      adminUsername = envUsername;
    }
    // 2. Check against database hashed credentials if DB is available
    else if (dbAdmin && bcrypt.compareSync(password, dbAdmin.password_hash)) {
      isAuthenticated = true;
      adminId = dbAdmin.id;
      adminUsername = dbAdmin.username;
    }

    if (!isAuthenticated) {
      recordFailedAttempt(ip);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    clearLoginAttempts(ip);

    const session = await getSession();
    session.adminId = adminId;
    session.adminUsername = adminUsername;
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({ success: true, username: adminUsername });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error('Admin login server exception:', err);
    return NextResponse.json(
      { error: `Server error during authentication: ${errorMsg}` },
      { status: 500 }
    );
  }
}
