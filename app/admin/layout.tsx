import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Panel — MERCHANT ZONE',
  robots: 'noindex, nofollow',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950">
      {children}
    </div>
  );
}
