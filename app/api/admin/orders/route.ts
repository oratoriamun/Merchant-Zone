import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdminSession, adminAuthResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) return adminAuthResponse();

  const db = getDb();
  const url = new URL(req.url);

  const search = url.searchParams.get('search') || '';
  const service = url.searchParams.get('service') || '';
  const paymentStatus = url.searchParams.get('payment_status') || '';
  const orderStatus = url.searchParams.get('order_status') || '';
  const dateFrom = url.searchParams.get('date_from') || '';
  const dateTo = url.searchParams.get('date_to') || '';
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '20', 10);
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const bindParams: (string | number)[] = [];

  if (search) {
    conditions.push('(o.order_number LIKE ? OR o.customer_name LIKE ? OR o.mobile LIKE ? OR o.transaction_reference LIKE ?)');
    const s = `%${search}%`;
    bindParams.push(s, s, s, s);
  }
  if (service) {
    conditions.push('o.service_name_snapshot LIKE ?');
    bindParams.push(`%${service}%`);
  }
  if (paymentStatus) {
    conditions.push('o.payment_status = ?');
    bindParams.push(paymentStatus);
  }
  if (orderStatus) {
    conditions.push('o.order_status = ?');
    bindParams.push(orderStatus);
  }
  if (dateFrom) {
    conditions.push('o.created_at >= ?');
    bindParams.push(dateFrom);
  }
  if (dateTo) {
    conditions.push('o.created_at <= ?');
    bindParams.push(dateTo + ' 23:59:59');
  }

  const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

  const total = (db.prepare(`SELECT COUNT(*) as c FROM orders o ${where}`).get(...bindParams) as { c: number }).c;
  const orders = db.prepare(`
    SELECT o.id, o.order_number, o.customer_name, o.mobile, o.email,
           o.service_name_snapshot, o.service_category_snapshot,
           o.service_price_snapshot, o.amount_paid,
           o.transaction_reference, o.payment_screenshot,
           o.payment_status, o.order_status, o.created_at, o.updated_at
    FROM orders o ${where}
    ORDER BY o.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...bindParams, limit, offset);

  return NextResponse.json({ orders, total, page, limit, totalPages: Math.ceil(total / limit) });
}
