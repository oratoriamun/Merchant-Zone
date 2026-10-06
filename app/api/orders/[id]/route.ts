import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const orderNumber = params.id;
  const db = getDb();

  const order = db.prepare(`
    SELECT id, order_number, customer_name, service_name_snapshot, service_category_snapshot,
           service_price_snapshot, amount_paid, transaction_reference, payment_status,
           order_status, created_at, updated_at
    FROM orders WHERE order_number = ?
  `).get(orderNumber);

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json({ order });
}
