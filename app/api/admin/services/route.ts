import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdminSession, adminAuthResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) return adminAuthResponse();

  const db = getDb();
  const url = new URL(req.url);
  const category = url.searchParams.get('category') || '';
  const includeInactive = url.searchParams.get('include_inactive') === 'true';

  let query = 'SELECT * FROM services';
  const conditions: string[] = [];
  const bindParams: (string | number)[] = [];

  if (!includeInactive) {
    conditions.push('active = 1');
  }
  if (category) {
    conditions.push('category = ?');
    bindParams.push(category);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  query += ' ORDER BY category, service_name';

  const services = db.prepare(query).all(...bindParams);
  return NextResponse.json({ services });
}

export async function POST(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) return adminAuthResponse();

  let body: { category?: string; service_name?: string; price?: number; logo_url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const { category, service_name, price, logo_url } = body;
  if (!category || !service_name || price === undefined) {
    return NextResponse.json({ error: 'category, service_name, and price are required' }, { status: 400 });
  }

  const db = getDb();
  const result = db.prepare(
    'INSERT INTO services (category, service_name, price, logo_url) VALUES (?, ?, ?, ?)'
  ).run(category, service_name, price, logo_url || null);

  return NextResponse.json({ id: result.lastInsertRowid });
}
