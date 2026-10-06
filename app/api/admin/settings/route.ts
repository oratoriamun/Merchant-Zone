import { NextRequest, NextResponse } from 'next/server';
import { getAllSettings, setSetting } from '@/lib/db';
import { requireAdminSession, adminAuthResponse } from '@/lib/auth';
import path from 'path';
import fs from 'fs';

const ALLOWED_SETTING_KEYS = [
  'payment_qr_url',
  'support_phone',
  'business_location',
  'payment_instructions',
  'refund_policy',
  'min_payment_amount',
  'site_name',
  'site_tagline',
  'whatsapp_number',
];

export async function GET() {
  const session = await requireAdminSession();
  if (!session) return adminAuthResponse();

  const settings = getAllSettings();
  return NextResponse.json({ settings });
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) return adminAuthResponse();

  // Check for QR upload (multipart)
  const contentType = req.headers.get('content-type') || '';

  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData();

    // Handle QR code upload
    const qrFile = formData.get('qr_image') as File | null;
    if (qrFile && qrFile.size > 0) {
      // Validate image
      const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowed.includes(qrFile.type)) {
        return NextResponse.json({ error: 'QR image must be JPG, PNG, WEBP, or GIF' }, { status: 400 });
      }
      const ext = path.extname(qrFile.name) || '.png';
      const filename = `qr_${Date.now()}${ext}`;
      const publicPath = path.join(process.cwd(), 'public', 'images', filename);
      const dir = path.dirname(publicPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const buffer = Buffer.from(await qrFile.arrayBuffer());
      fs.writeFileSync(publicPath, buffer);
      setSetting('payment_qr_url', `/images/${filename}`);
    }

    // Handle other settings from form
    for (const key of ALLOWED_SETTING_KEYS) {
      const val = formData.get(key) as string | null;
      if (val !== null && val !== undefined) {
        setSetting(key, val);
      }
    }

    return NextResponse.json({ success: true, settings: getAllSettings() });
  }

  // JSON settings update
  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  for (const [key, value] of Object.entries(body)) {
    if (!ALLOWED_SETTING_KEYS.includes(key)) {
      return NextResponse.json({ error: `Unknown setting key: ${key}` }, { status: 400 });
    }
    if (key === 'min_payment_amount') {
      const n = parseInt(value, 10);
      if (isNaN(n) || n < 0) {
        return NextResponse.json({ error: 'min_payment_amount must be a positive number' }, { status: 400 });
      }
    }
    setSetting(key, value);
  }

  return NextResponse.json({ success: true, settings: getAllSettings() });
}
