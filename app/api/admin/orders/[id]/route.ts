import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdminSession, adminAuthResponse } from '@/lib/auth';

const VALID_ORDER_STATUSES = [
  'PAYMENT_VERIFICATION_PENDING',
  'PAYMENT_RECEIVED',
  'PAYMENT_NOT_RECEIVED',
  'UNDER_REVIEW',
  'PROCESSING',
  'COMPLETED',
  'CANCELLED',
];

const VALID_PAYMENT_STATUSES = ['PENDING', 'RECEIVED', 'REJECTED'];

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) return adminAuthResponse();

  const db = getDb();
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(parseInt(params.id, 10));

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json({ order });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) return adminAuthResponse();

  let body: {
    order_status?: string;
    payment_status?: string;
    admin_notes?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const db = getDb();
  const orderId = parseInt(params.id, 10);

  const existing = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as {
    id: number;
    order_number: string;
    order_status: string;
    payment_status: string;
  } | undefined;

  if (!existing) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  const updates: string[] = [];
  const values: (string | number)[] = [];

  if (body.order_status !== undefined) {
    if (!VALID_ORDER_STATUSES.includes(body.order_status)) {
      return NextResponse.json({ error: 'Invalid order status' }, { status: 400 });
    }
    updates.push('order_status = ?');
    values.push(body.order_status);
  }

  if (body.payment_status !== undefined) {
    if (!VALID_PAYMENT_STATUSES.includes(body.payment_status)) {
      return NextResponse.json({ error: 'Invalid payment status' }, { status: 400 });
    }
    updates.push('payment_status = ?');
    values.push(body.payment_status);
  }

  if (body.admin_notes !== undefined) {
    updates.push('admin_notes = ?');
    values.push(body.admin_notes);
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  updates.push("updated_at = datetime('now')");
  values.push(orderId);

  db.prepare(`UPDATE orders SET ${updates.join(', ')} WHERE id = ?`).run(...values);

  // Audit log
  const action = body.order_status
    ? `Status changed to ${body.order_status}`
    : body.payment_status
    ? `Payment status changed to ${body.payment_status}`
    : 'Notes updated';

  db.prepare(`
    INSERT INTO admin_audit_log (admin_id, action, order_number, previous_status, new_status, details)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    session.adminId!,
    action,
    existing.order_number,
    body.order_status ? existing.order_status : (body.payment_status ? existing.payment_status : null),
    body.order_status || body.payment_status || null,
    JSON.stringify(body)
  );

  const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  return NextResponse.json({ order: updated });
}
