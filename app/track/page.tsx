'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency, formatDateTime, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, PAYMENT_STATUS_LABELS, PAYMENT_STATUS_COLORS } from '@/lib/utils';

interface Order {
  order_number: string;
  customer_name: string;
  service_name_snapshot: string;
  service_category_snapshot: string;
  amount_paid: number;
  transaction_reference: string;
  payment_status: string;
  order_status: string;
  created_at: string;
  updated_at: string;
}

function TrackContent() {
  const searchParams = useSearchParams();
  const initialOrder = searchParams.get('order') || '';

  const [query, setQuery] = useState(initialOrder);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const performSearch = async (orderId: string) => {
    if (!orderId.trim()) {
      setError('Please enter your Order ID');
      return;
    }
    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const res = await fetch(`/api/orders/${orderId.trim().toUpperCase()}`);
      const data = await res.json();
      if (data.order) {
        setOrder(data.order);
      } else {
        setError('Order not found. Please verify your Order ID (e.g. ORD-2026-XXXXXX).');
      }
    } catch {
      setError('Failed to fetch order. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  useEffect(() => {
    if (initialOrder) {
      performSearch(initialOrder);
    }
  }, [initialOrder]);

  const statusColor = order ? (ORDER_STATUS_COLORS[order.order_status] || 'bg-gray-100 text-gray-800') : '';
  const payStatusColor = order ? (PAYMENT_STATUS_COLORS[order.payment_status] || 'bg-gray-100 text-gray-800') : '';

  return (
    <div className="min-h-screen py-10 px-4 bg-slate-950 text-slate-100">
      <div className="max-w-lg mx-auto">
        {/* Branding Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-sm shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              MZ
            </div>
            <div>
              <span className="font-black text-white text-lg tracking-tight">MERCHANT ZONE</span>
              <span className="text-[10px] block text-amber-400/80 font-medium -mt-1 uppercase tracking-widest">Digital Solutions</span>
            </div>
          </Link>
          <Link href="/" className="text-xs text-white/50 hover:text-white transition-colors">
            ← Home
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white mb-2">Track Your Application</h1>
          <p className="text-white/50 text-sm">
            Enter your generated Order ID to check live verification &amp; processing status
          </p>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleTrack} className="glass rounded-3xl border border-white/12 p-6 mb-8 shadow-xl">
          <label className="form-label text-xs uppercase tracking-wider text-white/60 mb-2 block">
            Enter Order ID
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value.toUpperCase())}
              placeholder="e.g. ORD-2026-329078"
              className="form-input flex-1 font-mono uppercase tracking-wider text-sm"
              aria-label="Order ID"
            />
            <button
              type="submit"
              className="btn-primary px-6 py-3 flex-shrink-0 flex items-center justify-center cursor-pointer"
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Track'
              )}
            </button>
          </div>
          {error && <p className="text-red-400 text-xs mt-3 flex items-center gap-1">⚠ {error}</p>}
        </form>

        {/* Order Details Display */}
        {order && (
          <div className="glass rounded-3xl border border-white/12 p-6 sm:p-8 animate-fadeInUp shadow-2xl">
            <div className="text-center mb-6 pb-6 border-b border-white/10">
              <p className="text-white/40 text-[11px] uppercase tracking-widest mb-1">Application Order Number</p>
              <p className="text-white font-mono font-black text-2xl tracking-wider">{order.order_number}</p>
            </div>

            {/* Badges */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8">
              <div className="text-center">
                <span className="text-[10px] text-white/40 block uppercase tracking-wider mb-1">Application Status</span>
                <span className={`badge ${statusColor} text-xs font-bold px-3 py-1 rounded-full`}>
                  {ORDER_STATUS_LABELS[order.order_status] || order.order_status}
                </span>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-white/40 block uppercase tracking-wider mb-1">Payment Status</span>
                <span className={`badge ${payStatusColor} text-xs font-bold px-3 py-1 rounded-full`}>
                  {PAYMENT_STATUS_LABELS[order.payment_status] || order.payment_status}
                </span>
              </div>
            </div>

            {/* Order Attributes */}
            <div className="space-y-3.5 divide-y divide-white/8 text-sm">
              <div className="flex justify-between items-center pt-2">
                <span className="text-white/50 text-xs">Selected Service</span>
                <span className="text-white font-semibold">{order.service_name_snapshot}</span>
              </div>
              <div className="flex justify-between items-center pt-3">
                <span className="text-white/50 text-xs">Category</span>
                <span className="text-amber-400/90 text-xs font-medium">{order.service_category_snapshot}</span>
              </div>
              <div className="flex justify-between items-center pt-3">
                <span className="text-white/50 text-xs">Applicant Name</span>
                <span className="text-white font-medium">{order.customer_name}</span>
              </div>
              <div className="flex justify-between items-center pt-3">
                <span className="text-white/50 text-xs">Service Charge</span>
                <span className="text-amber-400 font-bold">{formatCurrency(order.amount_paid)}</span>
              </div>
              <div className="flex justify-between items-center pt-3">
                <span className="text-white/50 text-xs">Transaction / UTR Reference</span>
                <span className="text-white font-mono text-xs">{order.transaction_reference}</span>
              </div>
              <div className="flex justify-between items-center pt-3">
                <span className="text-white/50 text-xs">Submitted Date</span>
                <span className="text-white/70 text-xs">{formatDateTime(order.created_at)}</span>
              </div>
              <div className="flex justify-between items-center pt-3">
                <span className="text-white/50 text-xs">Last Updated</span>
                <span className="text-white/70 text-xs">{formatDateTime(order.updated_at)}</span>
              </div>
            </div>

            {/* Help / Notice */}
            <div className="mt-8 bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 text-center">
              <p className="text-blue-300 text-xs leading-relaxed">
                Need assistance regarding this application? Contact our support team with Order ID{' '}
                <strong className="text-white font-mono">{order.order_number}</strong>.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
          <div className="w-12 h-12 rounded-full border-2 border-amber-500 border-t-transparent animate-spin"></div>
        </div>
      }
    >
      <TrackContent />
    </Suspense>
  );
}
