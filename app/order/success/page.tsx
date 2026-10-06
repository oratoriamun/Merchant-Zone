'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency, formatDateTime, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils';

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  service_name_snapshot: string;
  service_category_snapshot: string;
  service_price_snapshot: number;
  amount_paid: number;
  transaction_reference: string;
  payment_status: string;
  order_status: string;
  created_at: string;
  updated_at: string;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!orderNumber) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    fetch(`/api/orders/${orderNumber}`)
      .then(r => r.json())
      .then(data => {
        if (data.order) setOrder(data.order);
        else setNotFound(true);
        setLoading(false);
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-4xl mb-4">❌</p>
          <h2 className="text-white text-xl font-bold mb-2">Order Not Found</h2>
          <Link href="/" className="btn-primary mt-4">Back to Home</Link>
        </div>
      </div>
    );
  }

  const statusColor = ORDER_STATUS_COLORS[order.order_status] || 'bg-gray-100 text-gray-800';
  const statusLabel = ORDER_STATUS_LABELS[order.order_status] || order.order_status;

  return (
    <div className="min-h-screen py-8 px-4 bg-slate-950 text-slate-100">
      <div className="max-w-lg mx-auto">
        {/* Branding Header */}
        <div className="flex items-center justify-center mb-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-sm shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              MZ
            </div>
            <div>
              <span className="font-black text-white text-lg tracking-tight">MERCHANT ZONE</span>
              <span className="text-[10px] block text-amber-400/80 font-medium -mt-1 uppercase tracking-widest">Digital Solutions</span>
            </div>
          </Link>
        </div>

        {/* Success Header */}
        <div className="text-center mb-8 animate-fadeInUp">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-4xl mx-auto mb-5 shadow-2xl shadow-green-500/30 animate-pulse-glow text-white font-bold">
            ✓
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
            REQUEST SUBMITTED SUCCESSFULLY
          </h1>
          <p className="text-amber-400 font-semibold text-sm">Awaiting Administrator Approval / Payment Verification</p>
        </div>

        {/* Status Banner */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-6 text-center animate-fadeInUp delay-100">
          <p className="text-amber-300 font-semibold text-sm">
            ⏳ Your request has been received and is awaiting administrator verification.
          </p>
          <p className="text-amber-200/60 text-xs mt-1">
            Please do not submit duplicate requests. You will be contacted for further steps.
          </p>
        </div>

        {/* Order Details */}
        <div className="glass rounded-2xl border border-white/10 p-6 animate-fadeInUp delay-200">
          {/* Order ID — prominent */}
          <div className="text-center bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/30 rounded-xl p-4 mb-6">
            <p className="text-white/50 text-xs uppercase tracking-widest mb-1">Your Order ID</p>
            <p className="text-white font-black text-2xl tracking-wider">{order.order_number}</p>
            <p className="text-blue-400 text-xs mt-1">Save this ID to track your application</p>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Service', value: order.service_name_snapshot },
              { label: 'Amount', value: formatCurrency(order.amount_paid) },
              { label: 'Transaction Reference', value: order.transaction_reference },
              { label: 'Submitted', value: formatDateTime(order.created_at) },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center py-2 border-b border-white/8 last:border-0">
                <span className="text-white/40 text-sm">{item.label}</span>
                <span className="text-white font-medium text-sm">{item.value}</span>
              </div>
            ))}

            <div className="flex justify-between items-center py-2">
              <span className="text-white/40 text-sm">Current Status</span>
              <span className={`badge ${statusColor}`}>{statusLabel}</span>
            </div>
          </div>
        </div>

        {/* What's Next */}
        <div className="glass rounded-2xl border border-white/10 p-6 mt-6 animate-fadeInUp delay-300">
          <h3 className="text-white font-bold mb-4">What Happens Next?</h3>
          <div className="space-y-3">
            {[
              { icon: '🔍', text: 'Administrator will verify your payment screenshot and transaction reference.' },
              { icon: '✉️', text: 'You may be contacted on your mobile/email for further information if required.' },
              { icon: '⚡', text: 'Once verified, your application will be processed.' },
              { icon: '🔔', text: 'Use your Order ID to track your application status anytime.' },
            ].map((item, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                <p className="text-white/60 text-sm">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6 animate-fadeInUp delay-400">
          <Link href={`/track?order=${order.order_number}`} className="btn-primary flex-1 text-center py-3">
            Track My Order →
          </Link>
          <Link href="/" className="btn-secondary flex-1 text-center py-3">
            Back to Services
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div></div>}>
      <SuccessContent />
    </Suspense>
  );
}
