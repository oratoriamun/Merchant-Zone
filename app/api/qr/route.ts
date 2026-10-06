import { NextResponse } from 'next/server';
import { ensureUploadDir } from '@/lib/upload';
import path from 'path';
import fs from 'fs';

export async function GET() {
  const uploadDir = ensureUploadDir();
  const extensions = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];

  // 1. Check if a persistent custom QR exists on persistent storage
  for (const ext of extensions) {
    const customPath = path.join(uploadDir, `custom_payment_qr${ext}`);
    if (fs.existsSync(customPath)) {
      const mime =
        ext === '.png'
          ? 'image/png'
          : ext === '.webp'
          ? 'image/webp'
          : ext === '.gif'
          ? 'image/gif'
          : 'image/jpeg';
      const buffer = fs.readFileSync(customPath);
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': mime,
          'Cache-Control': 'public, max-age=60, s-maxage=60',
        },
      });
    }
  }

  // 2. Fallback to default bundled BharatPe QR
  const defaultPath = path.join(process.cwd(), 'public', 'images', 'payment-qr.jpg');
  if (fs.existsSync(defaultPath)) {
    const buffer = fs.readFileSync(defaultPath);
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=300, s-maxage=300',
      },
    });
  }

  return NextResponse.json({ error: 'QR Code not available' }, { status: 404 });
}
