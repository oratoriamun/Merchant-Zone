'use client';

import { useEffect, useState } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import Link from 'next/link';

interface DashboardStats {
  total: number;
  new_requests: number;
  payment_pending: number;
  payment_received: number;
  payment_rejected: number;
  processing: number;
  completed: number;
  today: number;
}

interface RecentOrder {
  id: number;
  order_number: string;
  customer_name: string;
  service_name_snapshot: string;
  amount_paid: number;
  payment_status: string;
  order_status: string;
  created_at: string;
}

function StatCard({
  label,
  value,
  icon,
  color,
  href,
}: {
  label: string;
  value: number;
  icon: string;
  color: string;
  href?: string;
}) {
  const content = (
    <div className={`glass rounded-2xl p-5 border border-white/10 hover:border-opacity-50 transition-all group ${href ? 'cursor-pointer hover:-translate-y-1' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${color}`}>
          {icon}
        </div>
        {href && (
          <span className="text-white/20 group-hover:text-white/50 transition-colors text-xs">→</span>
        )}
      </div>
      <p className="text-3xl font-black text-white mb-1">{value.toLocaleString()}</p>
      <p className="text-white/40 text-sm">{label}</p>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/dashboard').then(r => r.json()),
      fetch('/api/admin/orders?limit=5').then(r => r.json()),
    ]).then(([statsData, ordersData]) => {
      if (statsData.stats) setStats(statsData.stats);
      if (ordersData.orders) setRecentOrders(ordersData.orders);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const STAT_CARDS = stats ? [
    { label: 'Total Requests', value: stats.total, icon: '📦', color: 'bg-blue-500/20', href: '/admin/orders' },
    { label: 'New Requests', value: stats.new_requests, icon: '🆕', color: 'bg-amber-500/20', href: '/admin/orders?status=PAYMENT_VERIFICATION_PENDING' },
    { label: 'Verification Pending', value: stats.payment_pending, icon: '⏳', color: 'bg-yellow-500/20', href: '/admin/orders?payment=PENDING' },
    { label: 'Payments Received', value: stats.payment_received, icon: '✅', color: 'bg-green-500/20', href: '/admin/orders?payment=RECEIVED' },
    { label: 'Payments Rejected', value: stats.payment_rejected, icon: '❌', color: 'bg-red-500/20', href: '/admin/orders?payment=REJECTED' },
    { label: 'Processing', value: stats.processing, icon: '⚙️', color: 'bg-purple-500/20', href: '/admin/orders?status=PROCESSING' },
    { label: 'Completed', value: stats.completed, icon: '🎉', color: 'bg-emerald-500/20', href: '/admin/orders?status=COMPLETED' },
    { label: "Today's Requests", value: stats.today, icon: '📅', color: 'bg-indigo-500/20' },
  ] : [];

  return (
    <AdminShell title="Dashboard">
      <div className="space-y-8">
        {/* Welcome */}
        <div>
          <h2 className="text-white text-xl font-bold">Welcome back 👋</h2>
          <p className="text-white/40 text-sm mt-1">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STAT_CARDS.map(card => (
              <StatCard key={card.label} {...card} />
            ))}
          </div>
        )}

        {/* Recent Orders */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold">Recent Orders</h3>
            <Link href="/admin/orders" className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
              View all →
            </Link>
          </div>

          <div className="glass rounded-2xl border border-white/10 overflow-hidden">
            {recentOrders.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-white/30">No orders yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Service</th>
                      <th>Amount</th>
                      <th>Payment</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map(order => (
                      <tr key={order.id}>
                        <td className="font-mono text-blue-400 text-xs">{order.order_number}</td>
                        <td className="text-white font-medium">{order.customer_name}</td>
                        <td className="text-white/60 text-xs max-w-[150px] truncate">{order.service_name_snapshot}</td>
                        <td className="text-white font-semibold">₹{order.amount_paid.toLocaleString()}</td>
                        <td>
                          <span className={`badge text-xs ${
                            order.payment_status === 'RECEIVED' ? 'bg-green-500/20 text-green-400' :
                            order.payment_status === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {order.payment_status}
                          </span>
                        </td>
                        <td>
                          <span className={`badge text-xs ${
                            order.order_status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' :
                            order.order_status === 'CANCELLED' ? 'bg-gray-500/20 text-gray-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {order.order_status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td>
                          <Link href={`/admin/orders/${order.id}`} className="text-blue-400 hover:text-blue-300 text-xs transition-colors">
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
        </div>
      </div>
    </AdminShell>
  );
}
