'use client';

import { useState, useEffect } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import { formatCurrency } from '@/lib/utils';

interface Service {
  id: number;
  category: string;
  service_name: string;
  price: number;
  logo_url: string | null;
  active: number;
  updated_at: string;
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Service>>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [filterCategory, setFilterCategory] = useState('');

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/services?include_inactive=true');
      const data = await res.json();
      setServices(data.services || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchServices(); }, []);

  const startEdit = (svc: Service) => {
    setEditing(svc.id);
    setEditForm({ service_name: svc.service_name, price: svc.price, logo_url: svc.logo_url || '' });
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditForm({});
  };

  const saveEdit = async (id: number) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        showToast('success', 'Service updated successfully');
        setEditing(null);
        await fetchServices();
      } else {
        const data = await res.json();
        showToast('error', data.error || 'Failed to update');
      }
    } catch {
      showToast('error', 'Network error');
    }
    setSaving(false);
  };

  const toggleActive = async (svc: Service) => {
    try {
      const res = await fetch(`/api/admin/services/${svc.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !svc.active }),
      });
      if (res.ok) {
        showToast('success', `Service ${svc.active ? 'disabled' : 'enabled'}`);
        await fetchServices();
      }
    } catch {
      showToast('error', 'Failed to update');
    }
  };

  const categories = Array.from(new Set(services.map(s => s.category)));
  const filtered = filterCategory ? services.filter(s => s.category === filterCategory) : services;
  const grouped = filtered.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {} as Record<string, Service[]>);

  return (
    <AdminShell title="Services Management">
      {toast && (
        <div className={`toast ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white`}>
          <span>{toast.type === 'success' ? '✓' : '⚠'}</span>
          <span className="text-sm">{toast.message}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Filter */}
        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="form-input max-w-xs text-sm"
            aria-label="Filter by category"
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <p className="text-white/40 text-sm">{filtered.length} services</p>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <p className="text-blue-300 text-sm">
            ℹ️ Disabling a service hides it from the customer website. Existing historical orders are not affected.
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl"></div>)}
          </div>
        ) : (
          Object.entries(grouped).map(([category, catServices]) => (
            <div key={category}>
              <h3 className="text-white font-bold mb-3">{category}</h3>
              <div className="glass rounded-2xl border border-white/10 overflow-hidden">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Service Name</th>
                      <th>Price</th>
                      <th>Logo URL</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {catServices.map(svc => (
                      <tr key={svc.id}>
                        {editing === svc.id ? (
                          <>
                            <td>
                              <input
                                type="text"
                                value={editForm.service_name || ''}
                                onChange={e => setEditForm(p => ({ ...p, service_name: e.target.value }))}
                                className="form-input text-sm py-1.5"
                                aria-label="Service name"
                              />
                            </td>
                            <td>
                              <div className="flex items-center gap-1">
                                <span className="text-white/40 text-sm">₹</span>
                                <input
                                  type="number"
                                  value={editForm.price || 0}
                                  onChange={e => setEditForm(p => ({ ...p, price: parseInt(e.target.value, 10) }))}
                                  className="form-input text-sm py-1.5 w-28"
                                  aria-label="Price"
                                />
                              </div>
                            </td>
                            <td>
                              <input
                                type="text"
                                value={editForm.logo_url || ''}
                                onChange={e => setEditForm(p => ({ ...p, logo_url: e.target.value }))}
                                placeholder="Logo URL (optional)"
                                className="form-input text-sm py-1.5 w-40"
                                aria-label="Logo URL"
                              />
                            </td>
                            <td>
                              <span className="badge bg-yellow-500/20 text-yellow-400 text-xs">Editing</span>
                            </td>
                            <td>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => saveEdit(svc.id)}
                                  disabled={saving}
                                  className="text-green-400 hover:text-green-300 text-xs font-medium transition-colors"
                                >
                                  {saving ? '...' : 'Save'}
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="text-white/30 hover:text-white/60 text-xs transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="text-white font-medium text-sm">{svc.service_name}</td>
                            <td className="text-white font-semibold text-sm">{formatCurrency(svc.price)}</td>
                            <td className="text-white/40 text-xs truncate max-w-[120px]">{svc.logo_url || '—'}</td>
                            <td>
                              <span className={`badge text-xs ${svc.active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                {svc.active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td>
                              <div className="flex gap-3">
                                <button
                                  onClick={() => startEdit(svc)}
                                  className="text-blue-400 hover:text-blue-300 text-xs font-medium transition-colors"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => toggleActive(svc)}
                                  className={`text-xs font-medium transition-colors ${svc.active ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'}`}
                                >
                                  {svc.active ? 'Disable' : 'Enable'}
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </AdminShell>
  );
}
