'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import { formatCurrency, formatDateTime, ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS, ORDER_STATUS_COLORS, PAYMENT_STATUS_COLORS } from '@/lib/utils';

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  mobile: string;
  email: string;
  bank_details: string | null;
  service_name_snapshot: string;
  service_category_snapshot: string;
  service_price_snapshot: number;
  amount_paid: number;
  transaction_reference: string;
  payment_screenshot: string | null;
  payment_status: string;
  order_status: string;
  customer_consent: number;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

interface ConfirmModal {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

function ConfirmModalComponent({ modal, onClose }: { modal: ConfirmModal; onClose: () => void }) {
  if (!modal.open) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-content">
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-2xl mx-auto mb-3">
            ⚠️
          </div>
          <h3 className="text-white font-bold text-lg">{modal.title}</h3>
          <p className="text-white/50 text-sm mt-2">{modal.message}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1 py-3">Cancel</button>
          <button
            onClick={() => { modal.onConfirm(); onClose(); }}
            className="bg-gradient-to-r from-red-600 to-rose-600 text-white font-semibold py-3 px-6 rounded-xl flex-1 hover:shadow-lg hover:shadow-red-500/30 transition-all"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

const STATUS_ACTIONS = [
  { label: '✓ Mark Payment Received', orderStatus: 'PAYMENT_RECEIVED', paymentStatus: 'RECEIVED', color: 'bg-green-600 hover:bg-green-700' },
  { label: '✗ Mark Payment Not Received', orderStatus: 'PAYMENT_NOT_RECEIVED', paymentStatus: 'REJECTED', color: 'bg-red-600 hover:bg-red-700' },
  { label: '🔍 Mark Under Review', orderStatus: 'UNDER_REVIEW', paymentStatus: null, color: 'bg-blue-600 hover:bg-blue-700' },
  { label: '⚙️ Mark Processing', orderStatus: 'PROCESSING', paymentStatus: null, color: 'bg-purple-600 hover:bg-purple-700' },
  { label: '🎉 Mark Completed', orderStatus: 'COMPLETED', paymentStatus: null, color: 'bg-emerald-600 hover:bg-emerald-700' },
  { label: '🚫 Mark Cancelled', orderStatus: 'CANCELLED', paymentStatus: null, color: 'bg-gray-600 hover:bg-gray-700' },
];

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [notesSaved, setNotesSaved] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [modal, setModal] = useState<ConfirmModal>({ open: false, title: '', message: '', onConfirm: () => {} });

  useEffect(() => {
    fetch(`/api/admin/orders/${orderId}`)
      .then(r => r.json())
      .then(data => {
        if (data.order) {
          setOrder(data.order);
          setNotes(data.order.admin_notes || '');
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [orderId]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const applyAction = async (orderStatus: string, paymentStatus: string | null) => {
    setActionLoading(true);
    try {
      const body: Record<string, string> = { order_status: orderStatus };
      if (paymentStatus) body.payment_status = paymentStatus;

      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setOrder(data.order);
        showToast('success', 'Order status updated successfully');
      } else {
        showToast('error', data.error || 'Update failed');
      }
    } catch {
      showToast('error', 'Network error');
    }
    setActionLoading(false);
  };

  const saveNotes = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_notes: notes }),
      });
      if (res.ok) {
        setNotesSaved(true);
        setTimeout(() => setNotesSaved(false), 2000);
      }
    } catch {}
    setActionLoading(false);
  };

  const confirmAction = (action: typeof STATUS_ACTIONS[0]) => {
    setModal({
      open: true,
      title: action.label,
      message: `Are you sure you want to ${action.label.toLowerCase().replace(/[^a-z\s]/g, '')} for Order ${order?.order_number}? This action will be logged.`,
      onConfirm: () => applyAction(action.orderStatus, action.paymentStatus),
    });
  };

  if (loading) {
    return (
      <AdminShell title="Order Detail">
        <div className="flex items-center justify-center py-32">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AdminShell>
    );
  }

  if (!order) {
    return (
      <AdminShell title="Order Not Found">
        <div className="text-center py-20">
          <p className="text-4xl mb-4">⚠️</p>
          <p className="text-white/50">Order not found</p>
          <button onClick={() => router.back()} className="btn-secondary mt-4">← Go Back</button>
        </div>
      </AdminShell>
    );
  }

  const orderStatusColor = ORDER_STATUS_COLORS[order.order_status] || '';
  const payStatusColor = PAYMENT_STATUS_COLORS[order.payment_status] || '';

  return (
    <AdminShell title={`Order ${order.order_number}`}>
      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white`}>
          <span>{toast.type === 'success' ? '✓' : '⚠'}</span>
          <span className="text-sm">{toast.message}</span>
        </div>
      )}

      <ConfirmModalComponent modal={modal} onClose={() => setModal(m => ({ ...m, open: false }))} />

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back + Header */}
        <div className="flex items-center gap-4 flex-wrap">
          <button onClick={() => router.back()} className="text-white/50 hover:text-white text-sm transition-colors">
            ← Back to Orders
          </button>
          <div className="flex gap-2 flex-wrap">
            <span className={`badge ${orderStatusColor}`}>
              {ORDER_STATUS_LABELS[order.order_status] || order.order_status}
            </span>
            <span className={`badge ${payStatusColor}`}>
              Payment: {PAYMENT_STATUS_LABELS[order.payment_status] || order.payment_status}
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left — Order Details */}
          <div className="lg:col-span-2 space-y-5">
            {/* Order Summary */}
            <div className="glass rounded-2xl border border-white/10 p-6">
              <h2 className="text-white font-bold text-lg mb-5">Order Summary</h2>
              <div className="space-y-3 divide-y divide-white/8">
                {[
                  { label: 'Order Number', value: order.order_number },
                  { label: 'Submitted', value: formatDateTime(order.created_at) },
                  { label: 'Last Updated', value: formatDateTime(order.updated_at) },
                  { label: 'Service', value: order.service_name_snapshot },
                  { label: 'Category', value: order.service_category_snapshot },
                  { label: 'Listed Price', value: formatCurrency(order.service_price_snapshot) },
                  { label: 'Amount Paid', value: formatCurrency(order.amount_paid) },
                  { label: 'Transaction Reference', value: order.transaction_reference },
                  { label: 'Customer Consent', value: order.customer_consent ? '✓ Confirmed' : '✗ Not confirmed' },
                ].map(item => (
                  <div key={item.label} className="flex flex-wrap gap-2 justify-between py-2.5">
                    <span className="text-white/40 text-sm">{item.label}</span>
                    <span className={`text-white font-medium text-sm text-right ${item.label === 'Order Number' ? 'font-mono text-blue-400' : ''}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Details */}
            <div className="glass rounded-2xl border border-white/10 p-6">
              <h2 className="text-white font-bold text-lg mb-5">Customer Information</h2>
              <div className="space-y-3 divide-y divide-white/8">
                {[
                  { label: 'Full Name', value: order.customer_name },
                  { label: 'Mobile Number', value: order.mobile },
                  { label: 'Email Address', value: order.email },
                  ...(order.bank_details ? [{ label: 'Bank Details', value: order.bank_details }] : []),
                ].map(item => (
                  <div key={item.label} className="flex flex-wrap gap-2 justify-between py-2.5">
                    <span className="text-white/40 text-sm">{item.label}</span>
                    <span className="text-white font-medium text-sm text-right">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Screenshot */}
            <div className="glass rounded-2xl border border-white/10 p-6">
              <h2 className="text-white font-bold text-lg mb-4">Payment Screenshot</h2>
              {order.payment_screenshot ? (
                <div>
                  <img
                    src={`/api/admin/uploads/${order.payment_screenshot}`}
                    alt="Payment proof"
                    className="max-w-full max-h-96 rounded-xl border border-white/10 object-contain"
                  />
                  <a
                    href={`/api/admin/uploads/${order.payment_screenshot}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block"
                  >
                    Open Full Size ↗
                  </a>
                </div>
              ) : (
                <div className="text-center py-10 border-2 border-dashed border-white/10 rounded-xl">
                  <p className="text-4xl mb-2">📷</p>
                  <p className="text-white/30 text-sm">No screenshot uploaded</p>
                </div>
              )}

              {/* Security Notice */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mt-4">
                <p className="text-amber-300/70 text-xs">
                  ⚠️ Do not mark payment as received based solely on a screenshot.
                  Verify the transaction reference against your bank/UPI records.
                </p>
              </div>
            </div>

            {/* Admin Notes */}
            <div className="glass rounded-2xl border border-white/10 p-6">
              <h2 className="text-white font-bold text-lg mb-4">Admin Notes</h2>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Internal notes (not visible to customer)..."
                className="form-input min-h-[100px] resize-none text-sm"
                rows={4}
              />
              <button
                onClick={saveNotes}
                disabled={actionLoading}
                className={`btn-primary text-sm py-2 mt-3 ${notesSaved ? 'from-green-600 to-emerald-600' : ''}`}
              >
                {notesSaved ? '✓ Saved!' : 'Save Notes'}
              </button>
            </div>
          </div>

          {/* Right — Actions */}
          <div className="space-y-5">
            <div className="glass rounded-2xl border border-white/10 p-5 sticky top-24">
              <h3 className="text-white font-bold mb-4">Admin Actions</h3>
              <div className="space-y-2">
                {STATUS_ACTIONS.map(action => (
                  <button
                    key={action.orderStatus}
                    onClick={() => confirmAction(action)}
                    disabled={actionLoading || order.order_status === action.orderStatus}
                    className={`w-full text-white text-sm font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 text-left ${action.color} disabled:opacity-30 disabled:cursor-not-allowed`}
                  >
                    {action.label}
                    {order.order_status === action.orderStatus && (
                      <span className="ml-2 text-xs opacity-60">(current)</span>
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-white/8">
                <p className="text-white/30 text-xs">
                  All status changes are logged in the admin audit trail.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
