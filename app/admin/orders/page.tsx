'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AdminShell from '@/components/admin/AdminShell';
import { formatCurrency, formatDateTime, ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@/lib/utils';

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  mobile: string;
  email: string;
  service_name_snapshot: string;
  service_category_snapshot: string;
  amount_paid: number;
  transaction_reference: string;
  payment_screenshot: string | null;
  payment_status: string;
  order_status: string;
  created_at: string;
  updated_at: string;
}

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-400',
  RECEIVED: 'bg-green-500/20 text-green-400',
  REJECTED: 'bg-red-500/20 text-red-400',
};

const ORDER_STATUS_STYLES: Record<string, string> = {
  PAYMENT_VERIFICATION_PENDING: 'bg-amber-500/20 text-amber-400',
  PAYMENT_RECEIVED: 'bg-green-500/20 text-green-400',
  PAYMENT_NOT_RECEIVED: 'bg-red-500/20 text-red-400',
  UNDER_REVIEW: 'bg-blue-500/20 text-blue-400',
  PROCESSING: 'bg-purple-500/20 text-purple-400',
  COMPLETED: 'bg-emerald-500/20 text-emerald-400',
  CANCELLED: 'bg-gray-500/20 text-gray-400',
};

function OrdersContent() {
  const searchParams = useSearchParams();

  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [paymentFilter, setPaymentFilter] = useState(searchParams.get('payment') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: '20',
      ...(search && { search }),
      ...(paymentFilter && { payment_status: paymentFilter }),
      ...(statusFilter && { order_status: statusFilter }),
      ...(dateFrom && { date_from: dateFrom }),
      ...(dateTo && { date_to: dateTo }),
    });

    try {
      const res = await fetch(`/api/admin/orders?${params}`);
      const data = await res.json();
      setOrders(data.orders || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch {}
    setLoading(false);
  }, [page, search, paymentFilter, statusFilter, dateFrom, dateTo]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  return (
    <AdminShell title="Orders">
      <div className="space-y-6">
        {/* Filters */}
        <div className="glass rounded-2xl border border-white/10 p-5">
          <form onSubmit={handleSearch} className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="lg:col-span-2">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by Order ID, Name, Mobile, UTR..."
                className="form-input text-sm"
                aria-label="Search orders"
              />
            </div>
            <select
              value={paymentFilter}
              onChange={e => { setPaymentFilter(e.target.value); setPage(1); }}
              className="form-input text-sm"
              aria-label="Filter by payment status"
            >
              <option value="">All Payment Status</option>
              <option value="PENDING">Pending</option>
              <option value="RECEIVED">Received</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="form-input text-sm"
              aria-label="Filter by order status"
            >
              <option value="">All Order Status</option>
              {Object.entries(ORDER_STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <button type="submit" className="btn-primary text-sm py-2">Search</button>
          </form>
          <div className="grid sm:grid-cols-2 gap-3 mt-3">
            <div>
              <label className="text-white/40 text-xs mb-1 block">Date From</label>
              <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} className="form-input text-sm" />
            </div>
            <div>
              <label className="text-white/40 text-xs mb-1 block">Date To</label>
              <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} className="form-input text-sm" />
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between">
          <p className="text-white/40 text-sm">
            {loading ? 'Loading...' : `${total} order${total !== 1 ? 's' : ''} found`}
          </p>
        </div>

        {/* Table */}
        <div className="glass rounded-2xl border border-white/10 overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-12 rounded-xl"></div>)}
            </div>
          ) : orders.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-white/30">No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="admin-table min-w-[1000px]">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date/Time</th>
                    <th>Customer</th>
                    <th>Mobile</th>
                    <th>Service</th>
                    <th>Amount</th>
                    <th>UTR</th>
                    <th>Screenshot</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td className="font-mono text-blue-400 text-xs whitespace-nowrap">{order.order_number}</td>
                      <td className="text-white/50 text-xs whitespace-nowrap">{formatDateTime(order.created_at)}</td>
                      <td className="text-white font-medium text-sm">{order.customer_name}</td>
                      <td className="text-white/60 text-sm">{order.mobile}</td>
                      <td className="text-white/60 text-xs max-w-[120px] truncate">{order.service_name_snapshot}</td>
                      <td className="text-white font-semibold text-sm">{formatCurrency(order.amount_paid)}</td>
                      <td className="text-white/50 text-xs max-w-[100px] truncate">{order.transaction_reference}</td>
                      <td>
                        {order.payment_screenshot ? (
                          <a
                            href={`/api/admin/uploads/${order.payment_screenshot}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-xs underline"
                          >
                            View 🖼️
                          </a>
                        ) : (
                          <span className="text-white/20 text-xs">—</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge text-xs ${PAYMENT_STATUS_STYLES[order.payment_status] || ''}`}>
                          {PAYMENT_STATUS_LABELS[order.payment_status] || order.payment_status}
                        </span>
                      </td>
                      <td>
                        <span className={`badge text-xs ${ORDER_STATUS_STYLES[order.order_status] || ''}`}>
                          {order.order_status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td>
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-blue-400 hover:text-blue-300 text-xs font-medium transition-colors whitespace-nowrap"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-secondary text-sm py-2 px-4 disabled:opacity-30"
            >
              ← Prev
            </button>
            <span className="text-white/50 text-sm">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn-secondary text-sm py-2 px-4 disabled:opacity-30"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </AdminShell>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<AdminShell title="Orders"><div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div></AdminShell>}>
      <OrdersContent />
    </Suspense>
  );
}
