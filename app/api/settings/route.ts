import { NextRequest, NextResponse } from 'next/server';
import { getAllSettings } from '@/lib/db';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const keys = url.searchParams.get('keys');

  if (keys) {
    const keyList = keys.split(',');
    const settings = getAllSettings();
    const filtered: Record<string, string> = {};
    const PUBLIC_KEYS = [
      'support_phone', 'business_location', 'payment_instructions',
      'refund_policy', 'min_payment_amount', 'site_name', 'site_tagline',
      'payment_qr_url', 'whatsapp_number',
    ];
    for (const key of keyList) {
      if (PUBLIC_KEYS.includes(key) && settings[key]) {
        filtered[key] = settings[key];
      }
    }
    return NextResponse.json({ settings: filtered });
  }

  // Return only public settings
  const settings = getAllSettings();
  const publicSettings: Record<string, string> = {};
  const PUBLIC_KEYS = [
    'support_phone', 'business_location', 'payment_instructions',
    'refund_policy', 'min_payment_amount', 'site_name', 'site_tagline',
    'payment_qr_url', 'whatsapp_number',
  ];
  for (const key of PUBLIC_KEYS) {
    if (settings[key]) publicSettings[key] = settings[key];
  }
  return NextResponse.json({ settings: publicSettings });
}
