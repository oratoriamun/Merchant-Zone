'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError('Please enter username and password');
      return;
    }
    setLoading(true);
    setError('');

    try {
      let res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.status === 404) {
        res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      }

      let data: { error?: string } | null = null;
      try {
        data = (await res.json()) as { error?: string };
      } catch {
        const text = await res.text().catch(() => '');
        setError(`Server error (${res.status}): ${text.slice(0, 80) || res.statusText || 'Non-JSON server response'}`);
        return;
      }

      if (res.ok) {
        router.push('/admin/dashboard');
      } else {
        setError(data?.error || `Login failed (${res.status})`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to connect to server. Please try again.';
      setError(`Connection error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-2xl mx-auto mb-4 shadow-2xl shadow-amber-500/20">
            MZ
          </div>
          <h1 className="text-2xl font-black text-white">Admin Panel</h1>
          <p className="text-white/40 text-sm mt-1">MERCHANT ZONE Administration</p>
        </div>

        {/* Security Notice */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-6">
          <p className="text-amber-300/80 text-xs text-center">
            🔒 Restricted Area — Authorized Personnel Only
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-2xl border border-white/10 p-8 shadow-2xl">
          <div className="space-y-5">
            <div>
              <label className="form-label">Username</label>
              <input
                type="text"
                value={form.username}
                onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                placeholder="Admin username"
                className="form-input"
                autoComplete="username"
                aria-label="Admin username"
              />
            </div>

            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="Enter password"
                  className="form-input pr-12"
                  autoComplete="current-password"
                  aria-label="Admin password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors text-sm"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <p className="text-red-400 text-sm text-center">⚠ {error}</p>
              </div>
            )}

            <button
              type="submit"
              className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Authenticating...
                </>
              ) : (
                '→ Sign In'
              )}
            </button>
          </div>
        </form>

        <p className="text-center text-white/20 text-xs mt-6">
          Not an administrator? <a href="/" className="text-white/40 hover:text-white/60 transition-colors">Return to website</a>
        </p>
      </div>
    </div>
  );
}
