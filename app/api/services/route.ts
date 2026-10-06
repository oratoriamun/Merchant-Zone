import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  const db = getDb();
  const url = new URL(req.url);
  const category = url.searchParams.get('category') || '';

  let query = 'SELECT id, category, service_name, price, logo_url FROM services WHERE active = 1';
  const bindParams: string[] = [];

  if (category) {
    query += ' AND category = ?';
    bindParams.push(category);
  }
  query += ' ORDER BY category, id';

  const services = db.prepare(query).all(...bindParams);
  return NextResponse.json({ services });
}
