'use client';

import { useState, useEffect } from 'react';
import AdminShell from '@/components/admin/AdminShell';

interface Settings {
  support_phone: string;
  business_location: string;
  payment_instructions: string;
  refund_policy: string;
  min_payment_amount: string;
  site_name: string;
  site_tagline: string;
  payment_qr_url: string;
  whatsapp_number: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    support_phone: '',
    business_location: '',
    payment_instructions: '',
    refund_policy: '',
    min_payment_amount: '1500',
    site_name: '',
    site_tagline: '',
    payment_qr_url: '',
    whatsapp_number: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string>('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(data => {
        if (data.settings) {
          setSettings(prev => ({ ...prev, ...data.settings }));
          if (data.settings.payment_qr_url) setQrPreview(data.settings.payment_qr_url);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleQrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setQrFile(file);
    const reader = new FileReader();
    reader.onload = ev => setQrPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      for (const [key, value] of Object.entries(settings)) {
        fd.append(key, value);
      }
      if (qrFile) fd.append('qr_image', qrFile);

      const res = await fetch('/api/admin/settings', { method: 'PATCH', body: fd });
      const data = await res.json();
      if (res.ok) {
        showToast('success', 'Settings saved successfully');
        if (data.settings) setSettings(prev => ({ ...prev, ...data.settings }));
        setQrFile(null);
      } else {
        showToast('error', data.error || 'Failed to save settings');
      }
    } catch {
      showToast('error', 'Network error');
    }
    setSaving(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    setPasswordLoading(true);
    setPasswordMsg(null);
    try {
      const res = await fetch('/api/admin/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordForm),
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordMsg({ type: 'success', text: 'Password changed successfully' });
        setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      } else {
        setPasswordMsg({ type: 'error', text: data.error || 'Failed to change password' });
      }
    } catch {
      setPasswordMsg({ type: 'error', text: 'Network error' });
    }
    setPasswordLoading(false);
  };

  if (loading) {
    return (
      <AdminShell title="Settings">
        <div className="flex items-center justify-center py-32">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AdminShell>
    );
  }

  const Field = ({ label, id, type = 'text', value, onChange, hint }: {
    label: string; id: string; type?: string;
    value: string; onChange: (v: string) => void; hint?: string;
  }) => (
    <div>
      <label htmlFor={id} className="form-label">{label}</label>
      <input id={id} type={type} value={value} onChange={e => onChange(e.target.value)} className="form-input" />
      {hint && <p className="text-white/30 text-xs mt-1">{hint}</p>}
    </div>
  );

  return (
    <AdminShell title="Settings">
      {toast && (
        <div className={`toast ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white`}>
          <span>{toast.type === 'success' ? '✓' : '⚠'}</span>
          <span className="text-sm">{toast.message}</span>
        </div>
      )}

      <div className="max-w-3xl mx-auto space-y-8">
        {/* Site Settings */}
        <div className="glass rounded-2xl border border-white/10 p-6">
          <h2 className="text-white font-bold text-lg mb-5">Site Settings</h2>
          <div className="space-y-4">
            <Field label="Site Name" id="site_name" value={settings.site_name} onChange={v => setSettings(p => ({ ...p, site_name: v }))} />
            <Field label="Site Tagline" id="site_tagline" value={settings.site_tagline} onChange={v => setSettings(p => ({ ...p, site_tagline: v }))} />
          </div>
        </div>

        {/* Contact Settings */}
        <div className="glass rounded-2xl border border-white/10 p-6">
          <h2 className="text-white font-bold text-lg mb-5">Contact & Location</h2>
          <div className="space-y-4">
            <Field label="Support Phone" id="support_phone" value={settings.support_phone} onChange={v => setSettings(p => ({ ...p, support_phone: v }))} />
            <Field label="WhatsApp Number (digits only)" id="whatsapp_number" value={settings.whatsapp_number} onChange={v => setSettings(p => ({ ...p, whatsapp_number: v }))} hint="e.g. 9598581274 (without +91 or spaces)" />
            <Field label="Business Location" id="business_location" value={settings.business_location} onChange={v => setSettings(p => ({ ...p, business_location: v }))} />
          </div>
        </div>

        {/* Payment QR */}
        <div className="glass rounded-2xl border border-white/10 p-6">
          <h2 className="text-white font-bold text-lg mb-5">Payment QR Code</h2>
          <div className="grid sm:grid-cols-2 gap-6 items-start">
            <div>
              {qrPreview ? (
                <div className="bg-white rounded-2xl p-4 inline-block">
                  <img
                    src={qrPreview}
                    alt="Payment QR"
                    className="w-48 h-48 object-contain"
                    onError={e => (e.currentTarget.src = '/images/qr-placeholder.png')}
                  />
                </div>
              ) : (
                <div className="w-48 h-48 bg-white/5 rounded-2xl flex items-center justify-center text-white/20 border-2 border-dashed border-white/10">
                  No QR
                </div>
              )}
            </div>
            <div>
              <label className="form-label">Upload New QR Image</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleQrChange}
                className="form-input text-sm file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:text-xs file:font-medium file:cursor-pointer"
                aria-label="Upload QR image"
              />
              <p className="text-white/30 text-xs mt-2">JPG, PNG, WEBP, GIF supported</p>
              {qrFile && <p className="text-green-400 text-xs mt-1">✓ New QR selected: {qrFile.name}</p>}
            </div>
          </div>
        </div>

        {/* Payment Settings */}
        <div className="glass rounded-2xl border border-white/10 p-6">
          <h2 className="text-white font-bold text-lg mb-5">Payment Settings</h2>
          <div className="space-y-4">
            <Field
              label="Minimum Payment Amount (₹)"
              id="min_payment_amount"
              type="number"
              value={settings.min_payment_amount}
              onChange={v => setSettings(p => ({ ...p, min_payment_amount: v }))}
            />
            <div>
              <label htmlFor="payment_instructions" className="form-label">Payment Instructions</label>
              <textarea
                id="payment_instructions"
                value={settings.payment_instructions}
                onChange={e => setSettings(p => ({ ...p, payment_instructions: e.target.value }))}
                className="form-input min-h-[140px] resize-y text-sm"
                rows={6}
                placeholder="Enter step-by-step payment instructions..."
              />
              <p className="text-white/30 text-xs mt-1">Each line will be shown as a numbered step</p>
            </div>
            <div>
              <label htmlFor="refund_policy" className="form-label">Refund / Cancellation Policy</label>
              <textarea
                id="refund_policy"
                value={settings.refund_policy}
                onChange={e => setSettings(p => ({ ...p, refund_policy: e.target.value }))}
                className="form-input min-h-[100px] resize-y text-sm"
                rows={4}
                placeholder="Enter your refund and cancellation policy..."
              />
              <p className="text-white/30 text-xs mt-1">This text is shown to customers on the order page</p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={saveSettings}
          disabled={saving}
          className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </>
          ) : '✓ Save All Settings'}
        </button>

        {/* Change Password */}
        <div className="glass rounded-2xl border border-white/10 p-6">
          <h2 className="text-white font-bold text-lg mb-2">Change Admin Password</h2>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-5">
            <p className="text-amber-300 text-xs">
              ⚠️ Password must be at least 8 characters with at least one uppercase letter, one number, and one special character.
              Change the initial password before deployment.
            </p>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label htmlFor="current_password" className="form-label">Current Password</label>
              <input
                id="current_password"
                type="password"
                value={passwordForm.current_password}
                onChange={e => setPasswordForm(p => ({ ...p, current_password: e.target.value }))}
                className="form-input"
                autoComplete="current-password"
              />
            </div>
            <div>
              <label htmlFor="new_password" className="form-label">New Password</label>
              <input
                id="new_password"
                type="password"
                value={passwordForm.new_password}
                onChange={e => setPasswordForm(p => ({ ...p, new_password: e.target.value }))}
                className="form-input"
                autoComplete="new-password"
              />
            </div>
            <div>
              <label htmlFor="confirm_password" className="form-label">Confirm New Password</label>
              <input
                id="confirm_password"
                type="password"
                value={passwordForm.confirm_password}
                onChange={e => setPasswordForm(p => ({ ...p, confirm_password: e.target.value }))}
                className="form-input"
                autoComplete="new-password"
              />
            </div>

            {passwordMsg && (
              <div className={`rounded-xl p-3 ${passwordMsg.type === 'success' ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                <p className={`text-sm ${passwordMsg.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                  {passwordMsg.type === 'success' ? '✓' : '⚠'} {passwordMsg.text}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={passwordLoading}
              className="bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all w-full"
            >
              {passwordLoading ? 'Changing...' : '🔑 Change Password'}
            </button>
          </form>
        </div>
      </div>
    </AdminShell>
  );
}
