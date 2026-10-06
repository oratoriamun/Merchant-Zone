import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdminSession, adminAuthResponse } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) return adminAuthResponse();

  let body: { service_name?: string; price?: number; logo_url?: string; active?: boolean; category?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const db = getDb();
  const serviceId = parseInt(params.id, 10);

  const existing = db.prepare('SELECT * FROM services WHERE id = ?').get(serviceId);
  if (!existing) {
    return NextResponse.json({ error: 'Service not found' }, { status: 404 });
  }

  const updates: string[] = [];
  const values: (string | number | null)[] = [];

  if (body.service_name !== undefined) { updates.push('service_name = ?'); values.push(body.service_name); }
  if (body.price !== undefined) { updates.push('price = ?'); values.push(body.price); }
  if (body.logo_url !== undefined) { updates.push('logo_url = ?'); values.push(body.logo_url); }
  if (body.active !== undefined) { updates.push('active = ?'); values.push(body.active ? 1 : 0); }
  if (body.category !== undefined) { updates.push('category = ?'); values.push(body.category); }

  if (updates.length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  updates.push("updated_at = datetime('now')");
  values.push(serviceId);

  db.prepare(`UPDATE services SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  const updated = db.prepare('SELECT * FROM services WHERE id = ?').get(serviceId);
  return NextResponse.json({ service: updated });
}
