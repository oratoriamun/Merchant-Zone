import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const DB_PATH = process.env.DATABASE_PATH || './data/fintech_portal.db';
const dbDir = path.dirname(DB_PATH);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma('journal_mode = WAL');
    _db.pragma('foreign_keys = ON');
    initSchema(_db);
  }
  return _db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      service_name TEXT NOT NULL,
      price INTEGER NOT NULL,
      logo_url TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      mobile TEXT NOT NULL,
      email TEXT NOT NULL,
      bank_details TEXT,
      service_id INTEGER,
      service_name_snapshot TEXT NOT NULL,
      service_category_snapshot TEXT NOT NULL,
      service_price_snapshot INTEGER NOT NULL,
      amount_paid INTEGER NOT NULL,
      transaction_reference TEXT NOT NULL,
      payment_screenshot TEXT,
      payment_status TEXT NOT NULL DEFAULT 'PENDING',
      order_status TEXT NOT NULL DEFAULT 'PAYMENT_VERIFICATION_PENDING',
      customer_consent INTEGER NOT NULL DEFAULT 0,
      admin_notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS admin_audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER,
      action TEXT NOT NULL,
      order_number TEXT,
      previous_status TEXT,
      new_status TEXT,
      details TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL
    );
  `);

  seedAdmin(db);
  seedServices(db);
  seedSettings(db);
}

function seedAdmin(db: Database.Database) {
  const existing = db.prepare('SELECT id FROM admins WHERE username = ?').get('admin');
  if (!existing) {
    const initialPassword = process.env.ADMIN_INITIAL_PASSWORD || 'Rocky@22';
    const hash = bcrypt.hashSync(initialPassword, 12);
    db.prepare(
      'INSERT INTO admins (username, password_hash) VALUES (?, ?)'
    ).run('admin', hash);
    console.log('✅ Admin user seeded (username: admin, password: as configured in ADMIN_INITIAL_PASSWORD)');
  }
}

function seedSettings(db: Database.Database) {
  const defaults: Record<string, string> = {
    payment_qr_url: '/images/payment-qr.jpg',
    support_phone: '+91 9598581274',
    business_location: 'Varanasi, Uttar Pradesh',
    payment_instructions: '1. Scan the QR code above.\n2. Complete the payment for the exact amount shown.\n3. Enter the Transaction / UTR / Reference Number below.\n4. Upload a clear screenshot of the payment confirmation.\n5. Submit your request for administrator verification.',
    refund_policy: 'Service charges are subject to our cancellation and refund policy. Please contact support for details before making a payment.',
    min_payment_amount: '1500',
    site_name: 'MERCHANT ZONE',
    site_tagline: 'All Digital Payment & Banking Solutions — Smart Payment, Bigger Business',
    whatsapp_number: '9598581274',
  };

  const insertSetting = db.prepare(
    'INSERT OR IGNORE INTO site_settings (key, value) VALUES (?, ?)'
  );
  for (const [key, value] of Object.entries(defaults)) {
    insertSetting.run(key, value);
  }
}

export const SERVICES_DATA = [
  // MERCHANT SERVICES
  { category: 'Merchant Services', service_name: 'GPay Merchant', price: 1500 },
  { category: 'Merchant Services', service_name: 'MobiKwik Merchant', price: 1500 },
  { category: 'Merchant Services', service_name: 'PhonePe Merchant', price: 1800 },
  { category: 'Merchant Services', service_name: 'BharatPe Merchant', price: 1800 },
  { category: 'Merchant Services', service_name: 'Paytm Merchant (8 Lakh Limit)', price: 1800 },
  { category: 'Merchant Services', service_name: 'Paytm Merchant (60 Lakh Limit)', price: 2900 },
  { category: 'Merchant Services', service_name: 'Pine Labs Merchant', price: 3200 },
  { category: 'Merchant Services', service_name: 'Mosambee Pay Merchant', price: 3200 },
  // WALLET SERVICES
  { category: 'Wallet Services', service_name: 'MobiKwik Wallet', price: 1500 },
  { category: 'Wallet Services', service_name: 'Amazon Pay Wallet', price: 1500 },
  { category: 'Wallet Services', service_name: 'FamPay', price: 2500 },
  // SAVINGS ACCOUNT SERVICES
  { category: 'Savings Account Services', service_name: 'NSDL Savings Account', price: 2000 },
  { category: 'Savings Account Services', service_name: 'Airtel Savings Account', price: 2000 },
  { category: 'Savings Account Services', service_name: 'Jio Savings Account', price: 2000 },
  { category: 'Savings Account Services', service_name: 'SBI Savings Account', price: 3000 },
  { category: 'Savings Account Services', service_name: 'Bank of Baroda (BOB) Savings Account', price: 3000 },
  { category: 'Savings Account Services', service_name: 'Union Bank Savings Account', price: 3000 },
  // CURRENT ACCOUNT SERVICES
  { category: 'Current Account Services', service_name: 'Airtel Current Account', price: 6500 },
  { category: 'Current Account Services', service_name: 'Bank of Maharashtra Current Account', price: 8000 },
  { category: 'Current Account Services', service_name: 'Bank of India Current Account', price: 8000 },
  { category: 'Current Account Services', service_name: 'HDFC Current Account', price: 14000 },
  { category: 'Current Account Services', service_name: 'ICICI Current Account', price: 14000 },
  // AGENT / ONBOARDING SERVICES
  { category: 'Agent / Onboarding Services', service_name: 'GPay Agent ID', price: 9000 },
  { category: 'Agent / Onboarding Services', service_name: 'BharatPe Agent ID', price: 9000 },
  { category: 'Agent / Onboarding Services', service_name: 'MobiKwik Agent ID', price: 9000 },
  { category: 'Agent / Onboarding Services', service_name: 'PhonePe Agent ID', price: 10000 },
  { category: 'Agent / Onboarding Services', service_name: 'Paytm Agent ID', price: 12000 },
  { category: 'Agent / Onboarding Services', service_name: 'Mosambee Pay Agent ID', price: 15000 },
];

function seedServices(db: Database.Database) {
  const count = (db.prepare('SELECT COUNT(*) as c FROM services').get() as { c: number }).c;
  if (count === 0) {
    const insert = db.prepare(
      'INSERT INTO services (category, service_name, price) VALUES (?, ?, ?)'
    );
    for (const svc of SERVICES_DATA) {
      insert.run(svc.category, svc.service_name, svc.price);
    }
    console.log(`✅ Seeded ${SERVICES_DATA.length} services`);
  }
}

export function getSetting(key: string): string | null {
  const db = getDb();
  const row = db.prepare('SELECT value FROM site_settings WHERE key = ?').get(key) as { value: string } | undefined;
  return row?.value ?? null;
}

export function setSetting(key: string, value: string): void {
  const db = getDb();
  db.prepare(
    'INSERT OR REPLACE INTO site_settings (key, value, updated_at) VALUES (?, ?, datetime(\'now\'))'
  ).run(key, value);
}

export function getAllSettings(): Record<string, string> {
  const db = getDb();
  const rows = db.prepare('SELECT key, value FROM site_settings').all() as { key: string; value: string }[];
  return Object.fromEntries(rows.map(r => [r.key, r.value]));
}
