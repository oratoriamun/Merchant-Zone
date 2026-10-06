import { SessionOptions } from 'iron-session';

export interface SessionData {
  adminId?: number;
  adminUsername?: string;
  isLoggedIn?: boolean;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || 'fallback-secret-change-in-production-32chars',
  cookieName: 'merchantzone_admin_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 8, // 8 hours
  },
};
