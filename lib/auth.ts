import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from './session';
import { NextRequest, NextResponse } from 'next/server';

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function requireAdminSession(): Promise<SessionData | null> {
  const session = await getSession();
  if (!session.isLoggedIn || !session.adminId) {
    return null;
  }
  return session;
}

// Rate limiting: simple in-memory store (per-process, resets on restart)
const loginAttempts = new Map<string, { count: number; lastAttempt: number; lockedUntil: number }>();

const MAX_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const WINDOW_MS = 10 * 60 * 1000; // 10 minute window

export function checkRateLimit(ip: string): { allowed: boolean; remainingMs?: number } {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (record) {
    // Check if still locked
    if (now < record.lockedUntil) {
      return { allowed: false, remainingMs: record.lockedUntil - now };
    }
    // Reset if window expired
    if (now - record.lastAttempt > WINDOW_MS) {
      loginAttempts.delete(ip);
      return { allowed: true };
    }
    if (record.count >= MAX_ATTEMPTS) {
      record.lockedUntil = now + LOCK_DURATION_MS;
      return { allowed: false, remainingMs: LOCK_DURATION_MS };
    }
  }

  return { allowed: true };
}

export function recordFailedAttempt(ip: string) {
  const now = Date.now();
  const record = loginAttempts.get(ip) || { count: 0, lastAttempt: now, lockedUntil: 0 };
  record.count += 1;
  record.lastAttempt = now;
  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCK_DURATION_MS;
  }
  loginAttempts.set(ip, record);
}

export function clearLoginAttempts(ip: string) {
  loginAttempts.delete(ip);
}

export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1'
  );
}

export function adminAuthResponse(): NextResponse {
  return NextResponse.json(
    { error: 'Unauthorized — admin authentication required' },
    { status: 401 }
  );
}
