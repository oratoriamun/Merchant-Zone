import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdminSession, adminAuthResponse } from '@/lib/auth';

export async function GET() {
  const session = await requireAdminSession();
  if (!session) return adminAuthResponse();

  const db = getDb();
  const today = new Date().toISOString().split('T')[0];

  const stats = {
    total: (db.prepare('SELECT COUNT(*) as c FROM orders').get() as { c: number }).c,
    new_requests: (db.prepare("SELECT COUNT(*) as c FROM orders WHERE order_status = 'PAYMENT_VERIFICATION_PENDING'").get() as { c: number }).c,
    payment_pending: (db.prepare("SELECT COUNT(*) as c FROM orders WHERE payment_status = 'PENDING'").get() as { c: number }).c,
    payment_received: (db.prepare("SELECT COUNT(*) as c FROM orders WHERE payment_status = 'RECEIVED'").get() as { c: number }).c,
    payment_rejected: (db.prepare("SELECT COUNT(*) as c FROM orders WHERE payment_status = 'REJECTED'").get() as { c: number }).c,
    processing: (db.prepare("SELECT COUNT(*) as c FROM orders WHERE order_status = 'PROCESSING'").get() as { c: number }).c,
    completed: (db.prepare("SELECT COUNT(*) as c FROM orders WHERE order_status = 'COMPLETED'").get() as { c: number }).c,
    today: (db.prepare("SELECT COUNT(*) as c FROM orders WHERE date(created_at) = ?").get(today) as { c: number }).c,
  };

  return NextResponse.json({ stats });
}
