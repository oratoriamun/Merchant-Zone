'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface AdminShellProps {
  children: React.ReactNode;
  title?: string;
}

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/admin/orders', label: 'Orders', icon: '📋' },
  { href: '/admin/services', label: 'Services', icon: '🛠️' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
  { href: '/admin/audit', label: 'Audit Log', icon: '📜' },
];

export default function AdminShell({ children, title }: AdminShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [username, setUsername] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (!data.isLoggedIn) {
          router.push('/admin');
        } else {
          setUsername(data.username || 'Admin');
          setAuthChecked(true);
        }
      })
      .catch(() => router.push('/admin'));
  }, [router]);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin');
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const Sidebar = () => (
    <aside className="admin-sidebar w-64 flex-shrink-0 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-5 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-sm shadow-md shadow-amber-500/20">
            MZ
          </div>
          <div>
            <p className="text-white font-bold text-sm">MERCHANT ZONE</p>
            <p className="text-white/30 text-xs">Admin Management</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`admin-nav-item ${pathname === item.href || pathname.startsWith(item.href + '/') ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-white/8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {username.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{username}</p>
            <p className="text-white/30 text-xs">Administrator</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
        >
          <span>🚪</span>
          <span>{loggingOut ? 'Signing out...' : 'Sign Out'}</span>
        </button>

        <div className="mt-3 pt-3 border-t border-white/8">
          <Link href="/" target="_blank" className="flex items-center gap-2 px-3 py-2 rounded-xl text-white/30 hover:text-white/60 transition-colors text-xs">
            <span>↗</span>
            <span>View Customer Site</span>
          </Link>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="flex">
            <Sidebar />
          </div>
          <div
            className="flex-1 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          ></div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 border-b border-white/8 bg-slate-950/80 backdrop-blur-sm px-6 py-4 flex items-center gap-4">
          <button
            className="lg:hidden text-white/50 hover:text-white transition-colors"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {title && <h1 className="text-white font-bold text-lg">{title}</h1>}
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
