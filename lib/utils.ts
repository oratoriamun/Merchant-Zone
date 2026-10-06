export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `ORD-${year}-${random}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateTime(dateStr: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(dateStr));
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PAYMENT_VERIFICATION_PENDING: 'Payment Verification Pending',
  PAYMENT_RECEIVED: 'Payment Received',
  PAYMENT_NOT_RECEIVED: 'Payment Not Received / Rejected',
  UNDER_REVIEW: 'Under Review',
  PROCESSING: 'Processing',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  RECEIVED: 'Received',
  REJECTED: 'Rejected',
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  PAYMENT_VERIFICATION_PENDING: 'bg-yellow-100 text-yellow-800',
  PAYMENT_RECEIVED: 'bg-green-100 text-green-800',
  PAYMENT_NOT_RECEIVED: 'bg-red-100 text-red-800',
  UNDER_REVIEW: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
};

export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  RECEIVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
};

export const SERVICE_CATEGORY_ICONS: Record<string, string> = {
  'Merchant Services': '🏪',
  'Wallet Services': '👛',
  'Savings Account Services': '🏦',
  'Current Account Services': '💼',
  'Agent / Onboarding Services': '🤝',
};

export const SERVICE_CATEGORY_COLORS: Record<string, { from: string; to: string; accent: string }> = {
  'Merchant Services': { from: 'from-blue-600', to: 'to-indigo-700', accent: 'bg-blue-50 text-blue-700' },
  'Wallet Services': { from: 'from-purple-600', to: 'to-pink-700', accent: 'bg-purple-50 text-purple-700' },
  'Savings Account Services': { from: 'from-emerald-600', to: 'to-teal-700', accent: 'bg-emerald-50 text-emerald-700' },
  'Current Account Services': { from: 'from-amber-600', to: 'to-orange-700', accent: 'bg-amber-50 text-amber-700' },
  'Agent / Onboarding Services': { from: 'from-rose-600', to: 'to-red-700', accent: 'bg-rose-50 text-rose-700' },
};

// Brand logo mapping using emoji/text - replace with actual logo URLs later
export const BRAND_LOGOS: Record<string, string> = {
  'gpay': '🟢',
  'phonepe': '🟣',
  'paytm': '🔵',
  'bharatpe': '🟠',
  'mobikwik': '🔷',
  'pinelabs': '🔶',
  'mosambee': '🟤',
  'amazon pay': '🟡',
  'fampay': '🟩',
  'nsdl': '🏛️',
  'airtel': '🔴',
  'jio': '🔵',
  'sbi': '💙',
  'bob': '🟠',
  'union bank': '🔵',
  'bank of maharashtra': '🟢',
  'bank of india': '⭐',
  'hdfc': '🔷',
  'icici': '🟠',
};

export function needsBankDetails(serviceName: string): boolean {
  const lower = serviceName.toLowerCase();
  return lower.includes('account') || lower.includes('agent');
}
