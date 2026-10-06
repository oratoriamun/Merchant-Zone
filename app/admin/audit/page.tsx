'use client';

import { useState, useEffect } from 'react';
import AdminShell from '@/components/admin/AdminShell';

interface AuditLog {
  id: number;
  admin_username: string | null;
  action: string;
  order_number: string | null;
  previous_status: string | null;
  new_status: string | null;
  details: string | null;
  created_at: string;
}

function formatIST(dateStr: string) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(dateStr));
}

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/audit?page=${page}&limit=50`)
      .then(r => r.json())
      .then(data => {
        setLogs(data.logs || []);
        setTotal(data.total || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [page]);

  return (
    <AdminShell title="Audit Log">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-white/40 text-sm">{total} total audit entries</p>
        </div>

        <div className="glass rounded-2xl border border-white/10 overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-12 rounded-xl"></div>)}
            </div>
          ) : logs.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-4xl mb-3">📜</p>
              <p className="text-white/30">No audit entries yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="admin-table min-w-[700px]">
                <thead>
                  <tr>
                    <th>Date/Time</th>
                    <th>Admin</th>
                    <th>Action</th>
                    <th>Order</th>
                    <th>From Status</th>
                    <th>To Status</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.id}>
                      <td className="text-white/50 text-xs whitespace-nowrap">{formatIST(log.created_at)}</td>
                      <td className="text-white font-medium text-sm">{log.admin_username || '—'}</td>
                      <td className="text-white/70 text-sm">{log.action}</td>
                      <td className="font-mono text-blue-400 text-xs">{log.order_number || '—'}</td>
                      <td className="text-white/40 text-xs">{log.previous_status || '—'}</td>
                      <td className="text-white/70 text-xs">{log.new_status || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {total > 50 && (
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm py-2 px-4 disabled:opacity-30">← Prev</button>
            <span className="text-white/50 text-sm">Page {page}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={logs.length < 50} className="btn-secondary text-sm py-2 px-4 disabled:opacity-30">Next →</button>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
