import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { processUpload } from '@/lib/upload';
import { generateOrderNumber } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // Extract fields
    const serviceId = formData.get('service_id') as string;
    const customerName = (formData.get('customer_name') as string)?.trim();
    const mobile = (formData.get('mobile') as string)?.trim();
    const email = (formData.get('email') as string)?.trim();
    const bankDetails = (formData.get('bank_details') as string)?.trim() || null;
    const amountStr = formData.get('amount') as string;
    const transactionRef = (formData.get('transaction_reference') as string)?.trim();
    const consent = formData.get('consent') === 'true';

    // Validate required fields
    const errors: Record<string, string> = {};

    if (!customerName || customerName.length < 2) errors.customer_name = 'Full name is required (min 2 characters)';
    if (!mobile || !/^[6-9]\d{9}$/.test(mobile)) errors.mobile = 'Valid 10-digit mobile number required';
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Valid email address required';
    if (!transactionRef || transactionRef.length < 6) errors.transaction_reference = 'Transaction/UTR reference is required (min 6 characters)';
    if (!consent) errors.consent = 'You must confirm your consent to proceed';

    const amount = parseInt(amountStr, 10);
    const db = getDb();
    const minAmount = parseInt(
      (db.prepare('SELECT value FROM site_settings WHERE key = ?').get('min_payment_amount') as { value: string } | undefined)?.value || '1500',
      10
    );

    if (isNaN(amount) || amount < minAmount) {
      errors.amount = `Amount must be at least ₹${minAmount}`;
    }

    if (!serviceId) errors.service_id = 'Service selection is required';

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ error: 'Validation failed', fields: errors }, { status: 400 });
    }

    // Get service
    const service = db.prepare('SELECT * FROM services WHERE id = ? AND active = 1').get(parseInt(serviceId, 10)) as {
      id: number;
      category: string;
      service_name: string;
      price: number;
    } | undefined;

    if (!service) {
      return NextResponse.json({ error: 'Selected service not found or inactive' }, { status: 404 });
    }

    // Handle file upload
    let screenshotFilename: string | null = null;
    const file = formData.get('payment_screenshot') as File | null;
    if (file && file.size > 0) {
      const uploadResult = await processUpload(formData);
      if (!uploadResult.success) {
        return NextResponse.json({ error: uploadResult.error }, { status: 400 });
      }
      screenshotFilename = uploadResult.filename || null;
    }

    // Generate unique order number
    let orderNumber = generateOrderNumber();
    // Ensure uniqueness
    let attempts = 0;
    while (db.prepare('SELECT id FROM orders WHERE order_number = ?').get(orderNumber) && attempts < 5) {
      orderNumber = generateOrderNumber();
      attempts++;
    }

    // Insert order
    const result = db.prepare(`
      INSERT INTO orders (
        order_number, customer_name, mobile, email, bank_details,
        service_id, service_name_snapshot, service_category_snapshot, service_price_snapshot,
        amount_paid, transaction_reference, payment_screenshot,
        payment_status, order_status, customer_consent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', 'PAYMENT_VERIFICATION_PENDING', ?)
    `).run(
      orderNumber,
      customerName,
      mobile,
      email,
      bankDetails,
      service.id,
      service.service_name,
      service.category,
      service.price,
      amount,
      transactionRef,
      screenshotFilename,
      consent ? 1 : 0
    );

    return NextResponse.json({
      success: true,
      orderNumber,
      orderId: result.lastInsertRowid,
    });
  } catch (err) {
    console.error('Order creation error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const orderNumber = url.searchParams.get('order_number');

  if (!orderNumber) {
    return NextResponse.json({ error: 'Order number required' }, { status: 400 });
  }

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
