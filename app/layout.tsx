import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'MERCHANT ZONE — Digital Payment & Banking Solutions',
  description: 'Official MERCHANT ZONE Portal. Professional application assistance for merchant services, soundbox & POS, digital wallets, savings accounts, current accounts, and agent onboarding.',
  keywords: 'Merchant Zone, merchant services, soundbox, pos machine, wallet onboarding, savings account assistance, current account assistance, agent id, India fintech',
  openGraph: {
    title: 'MERCHANT ZONE — Digital Payment Solutions',
    description: 'All Digital Payment & Banking Solutions — Smart Payment, Bigger Business',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
