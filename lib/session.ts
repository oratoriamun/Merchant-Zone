import { SessionOptions } from 'iron-session';

export interface SessionData {
  adminId?: number;
  adminUsername?: string;
  isLoggedIn?: boolean;
}

const rawSecret = process.env.SESSION_SECRET || 'fallback-secret-change-in-production-32chars';
const sessionPassword = rawSecret.length >= 32 ? rawSecret : (rawSecret + '01234567890123456789012345678901').slice(0, 32);

export const sessionOptions: SessionOptions = {
  password: sessionPassword,
  cookieName: 'merchantzone_admin_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 hours
  },
};
