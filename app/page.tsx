'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatCurrency, SERVICE_CATEGORY_ICONS, SERVICE_CATEGORY_COLORS } from '@/lib/utils';
import BrandLogo from '@/components/customer/BrandLogo';

interface Service {
  id: number;
  category: string;
  service_name: string;
  price: number;
}

const ALL_CATEGORIES = 'All Services';

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass border-b border-white/10 shadow-2xl backdrop-blur-xl bg-slate-950/80' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black text-base shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-transform">
              MZ
            </div>
            <div>
              <span className="font-black text-white text-xl tracking-tight block">
                MERCHANT <span className="text-amber-400">ZONE</span>
              </span>
              <span className="text-[10px] text-white/50 block -mt-1 font-semibold tracking-widest uppercase">
                Digital Payment Solutions
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-7">
            <a href="#services" className="text-white/70 hover:text-amber-400 text-sm font-semibold transition-colors">
              Services
            </a>
            <a href="#showcase" className="text-white/70 hover:text-amber-400 text-sm font-semibold transition-colors">
              Solutions
            </a>
            <a href="#documents" className="text-white/70 hover:text-amber-400 text-sm font-semibold transition-colors">
              Documents
            </a>
            <a href="#how-it-works" className="text-white/70 hover:text-amber-400 text-sm font-semibold transition-colors">
              How It Works
            </a>
            <a href="#support" className="text-white/70 hover:text-amber-400 text-sm font-semibold transition-colors">
              Support
            </a>
            <Link
              href="/track"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-black py-2.5 px-5 rounded-xl shadow-lg shadow-amber-500/20 transition-all hover:-translate-y-0.5"
            >
              Track Order
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-white p-2 rounded-xl glass border border-white/10"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <div className={`space-y-1.5 transition-all ${menuOpen ? 'rotate-45' : ''}`}>
              <span className={`block w-6 h-0.5 bg-white transition-all ${menuOpen ? 'translate-y-2' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-white transition-all ${menuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-white transition-all ${menuOpen ? '-translate-y-2 -rotate-90' : ''}`}></span>
            </div>
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {menuOpen && (
          <div className="md:hidden glass rounded-2xl p-5 mb-4 animate-fadeIn border border-white/15 shadow-2xl bg-slate-900/95">
            <div className="flex flex-col gap-3">
              <a href="#services" className="text-white/80 hover:text-amber-400 py-2 text-sm font-semibold transition-colors" onClick={() => setMenuOpen(false)}>Services</a>
              <a href="#showcase" className="text-white/80 hover:text-amber-400 py-2 text-sm font-semibold transition-colors" onClick={() => setMenuOpen(false)}>Solutions</a>
              <a href="#documents" className="text-white/80 hover:text-amber-400 py-2 text-sm font-semibold transition-colors" onClick={() => setMenuOpen(false)}>Documents Required</a>
              <a href="#how-it-works" className="text-white/80 hover:text-amber-400 py-2 text-sm font-semibold transition-colors" onClick={() => setMenuOpen(false)}>How It Works</a>
              <a href="#support" className="text-white/80 hover:text-amber-400 py-2 text-sm font-semibold transition-colors" onClick={() => setMenuOpen(false)}>Support</a>
              <Link
                href="/track"
                className="bg-amber-500 text-slate-950 font-black text-center py-2.5 rounded-xl mt-2"
                onClick={() => setMenuOpen(false)}
              >
                Track Order
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-[92vh] flex flex-col justify-center pt-28 pb-16 px-4 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 animate-fadeInUp">
            <div className="inline-flex items-center gap-2.5 bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-2 mb-6">
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
              <span className="text-amber-300 text-xs sm:text-sm font-bold tracking-wide uppercase">
                Smart Payment • Bigger Business
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
              All Digital Payment &amp;
              <br />
              <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
                Banking Solutions
              </span>
            </h1>

            <p className="text-white/70 text-base sm:text-lg leading-relaxed mb-8 max-w-xl">
              India&apos;s trusted application assistance portal for Merchant Soundbox, POS Terminals,
              Payment Gateways, Digital Wallets, Current Accounts, and Agent IDs.
            </p>

            <div className="flex flex-wrap gap-4 mb-10">
              <a
                href="#services"
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-base px-8 py-3.5 rounded-xl shadow-xl shadow-amber-500/25 transition-all hover:-translate-y-0.5 inline-flex items-center gap-2 cursor-pointer"
              >
                Explore Services <span>↓</span>
              </a>
              <Link
                href="/track"
                className="glass border border-white/15 hover:border-amber-400/40 text-white font-bold text-base px-8 py-3.5 rounded-xl transition-all hover:-translate-y-0.5 inline-flex items-center gap-2"
              >
                Track My Order <span>🔍</span>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10">
              {[
                { icon: '🛡️', title: '100% Safe', sub: 'Verified Process' },
                { icon: '⚡', title: 'Fast Onboarding', sub: 'Priority Queue' },
                { icon: '🎧', title: 'Expert Support', sub: 'Assistance Team' },
                { icon: '🇮🇳', title: 'Digital India', sub: 'All India Service' },
              ].map(badge => (
                <div key={badge.title} className="flex items-center gap-3">
                  <span className="text-2xl">{badge.icon}</span>
                  <div>
                    <p className="text-white font-bold text-xs">{badge.title}</p>
                    <p className="text-white/40 text-[10px]">{badge.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Hero Visual Column (Official Merchant Zone Poster photo_2026-10-07_00-11-25.jpg) */}
          <div className="lg:col-span-5 animate-fadeInUp delay-200">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-blue-600/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-300"></div>
              <div className="relative glass rounded-3xl overflow-hidden border border-white/15 shadow-2xl p-2 bg-slate-900/80">
                <Image
                  src="/images/mz-merchants.jpg"
                  alt="MERCHANT ZONE — Smart Payment Bigger Business"
                  width={600}
                  height={800}
                  priority
                  className="w-full h-auto rounded-2xl object-cover hover:scale-[1.01] transition-transform duration-300"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SolutionsShowcase() {
  const cards = [
    {
      img: '/images/mz-merchants.jpg',
      title: 'Merchant & POS Solutions',
      tag: 'GPay, Paytm, PhonePe, BharatPe, Pine Labs',
      targetCategory: 'Merchant Services',
    },
    {
      img: '/images/mz-wallets.jpg',
      title: 'Digital Wallet Services',
      tag: 'MobiKwik, Amazon Pay, FamPay',
      targetCategory: 'Wallet Services',
    },
    {
      img: '/images/mz-current-accounts.jpg',
      title: 'Current Account Assistance',
      tag: 'HDFC, ICICI, Airtel, BOM, BOI',
      targetCategory: 'Current Account Services',
    },
    {
      img: '/images/mz-saving-accounts.jpg',
      title: 'Savings Account Assistance',
      tag: 'NSDL, Airtel, Jio, SBI, BOB, Union',
      targetCategory: 'Savings Account Services',
    },
  ];

  return (
    <section id="showcase" className="py-20 px-4 bg-slate-950/60 border-y border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-amber-400 text-xs font-bold uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full inline-block mb-3">
            Official Solution Categories
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
            Explore All Solutions
          </h2>
          <p className="text-white/50 text-sm max-w-xl mx-auto">
            Review our official application catalogs below and apply directly for fast-track processing
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map(card => (
            <div
              key={card.title}
              className="glass rounded-2xl overflow-hidden border border-white/10 hover:border-amber-500/40 transition-all duration-300 group hover:-translate-y-1 shadow-xl flex flex-col"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-900">
                <Image
                  src={card.img}
                  alt={card.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-white font-bold text-base group-hover:text-amber-400 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-white/50 text-xs mt-1">{card.tag}</p>
                </div>
                <a
                  href="#services"
                  className="mt-4 text-xs font-bold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 group-hover:gap-2 transition-all"
                >
                  View Services <span>→</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DocumentsRequiredSection() {
  return (
    <section id="documents" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="glass rounded-3xl border border-white/10 p-8 sm:p-12 relative overflow-hidden shadow-2xl">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="text-amber-400 text-xs font-bold uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full inline-block">
                Onboarding Requirements
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white">
                Details Required For Onboarding
              </h2>
              <p className="text-white/60 text-sm sm:text-base leading-relaxed">
                To guarantee smooth and rapid processing of your service application, please keep
                the following documents and credentials ready when applying:
              </p>

              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                {[
                  { num: '01', title: 'Aadhaar Card', desc: 'Valid front & back ID copy' },
                  { num: '02', title: 'PAN Card', desc: 'Individual or enterprise card' },
                  { num: '03', title: 'Mobile Number', desc: 'Active number linked with ID' },
                  { num: '04', title: 'Email Address', desc: 'Active email for communication' },
                  { num: '05', title: 'Bank Account Details', desc: 'Passbook / cancelled cheque' },
                  { num: '06', title: 'Payment Proof', desc: '12-digit UTR & screenshot' },
                ].map(item => (
                  <div key={item.title} className="flex items-start gap-3 glass p-3.5 rounded-xl border border-white/8">
                    <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-xs flex-shrink-0">
                      {item.num}
                    </span>
                    <div>
                      <p className="text-white font-bold text-sm">{item.title}</p>
                      <p className="text-white/40 text-[11px]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-white/15 shadow-2xl">
                <Image
                  src="/images/mz-requirements.jpg"
                  alt="Merchant Zone Details Required"
                  width={600}
                  height={600}
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ServiceCard({ service }: { service: Service }) {
  const colors = SERVICE_CATEGORY_COLORS[service.category] || SERVICE_CATEGORY_COLORS['Merchant Services'];

  // Order link with query parameters for instant pre-filling
  const orderHref = `/order/${service.id}?service=${encodeURIComponent(service.service_name)}&price=${service.price}&category=${encodeURIComponent(service.category)}`;

  return (
    <div className="service-card glass rounded-2xl p-6 border border-white/10 group flex flex-col justify-between hover:border-amber-500/40 transition-all duration-300">
      <div>
        <div className="flex items-start justify-between mb-4">
          <BrandLogo name={service.service_name} size="md" />
          <span className={`badge ${colors.accent} text-[11px] font-semibold px-2.5 py-0.5 rounded-full`}>
            {service.category.split(' ')[0]}
          </span>
        </div>

        <h3 className="text-white font-bold text-base mb-1 leading-snug group-hover:text-amber-400 transition-colors">
          {service.service_name}
        </h3>
        <p className="text-white/40 text-xs mb-5">
          Application Assistance Service
        </p>
      </div>

      <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
        <div>
          <p className="text-white/40 text-[11px] uppercase tracking-wider mb-0.5 font-medium">
            Service Charge
          </p>
          <p className="text-xl font-black text-amber-400 tracking-tight">
            {formatCurrency(service.price)}
          </p>
        </div>

        {/* High-priority Apply Now button */}
        <Link
          href={orderHref}
          className="apply-btn"
          aria-label={`Apply Now for ${service.service_name}`}
        >
          <span>Apply Now</span>
          <span className="text-base leading-none">→</span>
        </Link>
      </div>
    </div>
  );
}

function HowItWorksSection() {
  const steps = [
    { num: '1', icon: '🎯', title: 'Choose Your Service', desc: 'Browse our catalog and pick the service onboarding assistance you need.' },
    { num: '2', icon: '📝', title: 'Enter Your Details', desc: 'Fill in your name, mobile number, email, and basic verification info.' },
    { num: '3', icon: '💳', title: 'Scan & Pay via UPI', desc: 'Scan the official BharatPe QR code, complete payment, and upload proof.' },
    { num: '4', icon: '✅', title: 'Track Live Status', desc: 'Receive your unique Order ID to monitor administrative review in real time.' },
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 bg-slate-950/40">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-amber-400 text-xs font-bold uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full inline-block mb-3">
            Clear 4-Step Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
            How MERCHANT ZONE Works
          </h2>
          <p className="text-white/50 text-sm max-w-xl mx-auto">
            Simple, transparent, and secure onboarding application workflow
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map(step => (
            <div key={step.title} className="glass rounded-2xl p-6 border border-white/10 relative text-center group hover:border-amber-500/40 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center text-2xl mx-auto mb-4 font-black shadow-lg shadow-amber-500/20">
                {step.icon}
              </div>
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest block mb-1">
                Step {step.num}
              </span>
              <h3 className="text-white font-bold text-base mb-2">{step.title}</h3>
              <p className="text-white/50 text-xs leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SupportSection({ phone, location, whatsapp }: { phone: string; location: string; whatsapp: string }) {
  return (
    <section id="support" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="glass rounded-3xl border border-white/10 p-8 sm:p-12">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-amber-400 text-xs font-bold uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full inline-block mb-3">
                Helpdesk &amp; Support
              </span>
              <h2 className="text-3xl font-black text-white mb-4">We&apos;re Here to Help</h2>
              <p className="text-white/50 text-sm leading-relaxed mb-6">
                Our support desk is available to assist you with inquiries, document requirements,
                and application tracking.
              </p>
              <div className="flex items-center gap-3 text-xs text-white/40">
                <span>📍 Located in {location}</span>
                <span>•</span>
                <span>🕒 Fast Turnaround</span>
              </div>
            </div>

            <div className="space-y-4">
              <a
                href={`tel:${phone}`}
                className="flex items-center gap-4 glass rounded-2xl p-4 border border-white/10 hover:border-amber-500/50 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-105 transition-transform">
                  📞
                </div>
                <div>
                  <p className="text-white/40 text-xs font-medium uppercase tracking-wide">Phone Support</p>
                  <p className="text-white font-bold text-base sm:text-lg">{phone}</p>
                </div>
              </a>

              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 glass rounded-2xl p-4 border border-white/10 hover:border-green-500/50 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-105 transition-transform">
                  💬
                </div>
                <div>
                  <p className="text-white/40 text-xs font-medium uppercase tracking-wide">WhatsApp Support</p>
                  <p className="text-white font-bold text-base sm:text-lg">Chat with Support Desk</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer({ siteName, location }: { siteName: string; location: string }) {
  return (
    <footer className="border-t border-white/10 py-12 px-4 bg-slate-950">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black text-base shadow-lg shadow-amber-500/25">
                MZ
              </div>
              <span className="font-black text-white text-xl tracking-tight">
                MERCHANT <span className="text-amber-400">ZONE</span>
              </span>
            </div>
            <p className="text-white/50 text-xs leading-relaxed max-w-sm mb-4">
              All Digital Payment &amp; Banking Solutions. Professional service application and
              onboarding assistance for merchants across India.
            </p>
            <p className="text-white/40 text-xs">📍 {location}</p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 text-xs uppercase tracking-wider text-amber-400">
              Quick Links
            </h4>
            <div className="space-y-2 text-xs">
              <a href="#services" className="block text-white/50 hover:text-white transition-colors">All Services</a>
              <a href="#showcase" className="block text-white/50 hover:text-white transition-colors">Solutions Catalog</a>
              <a href="#documents" className="block text-white/50 hover:text-white transition-colors">Documents Required</a>
              <a href="#how-it-works" className="block text-white/50 hover:text-white transition-colors">How It Works</a>
              <Link href="/track" className="block text-white/50 hover:text-white transition-colors">Track Order</Link>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 text-xs uppercase tracking-wider text-amber-400">
              Administration
            </h4>
            <div className="space-y-2 text-xs">
              <Link href="/admin" className="block text-white/50 hover:text-white transition-colors">
                Admin Panel Login →
              </Link>
              <Link href="/track" className="block text-white/50 hover:text-white transition-colors">
                Order Tracking Status →
              </Link>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="border-t border-white/10 pt-8 space-y-3">
          <p className="text-white/30 text-[11px] leading-relaxed">
            <strong className="text-white/50">Disclaimer:</strong> All third-party brand names, logos, and trademarks
            (including Google Pay, PhonePe, Paytm, BharatPe, MobiKwik, Pine Labs, Amazon Pay, FamPay, HDFC, ICICI, SBI, BOB, Airtel, Jio)
            belong to their respective trademark owners. Display of brand names is for service identification purposes only
            and does not imply any endorsement, affiliation, or partnership. {siteName} is an independent application assistance
            portal. All service charges collected are exclusively for processing, documentation, and application assistance services.
          </p>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-4 text-white/40 text-xs">
            <p>© {new Date().getFullYear()} MERCHANT ZONE. All rights reserved.</p>
            <p className="text-amber-400/70 text-[11px]">Smart Payment • Bigger Business</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<string[]>([ALL_CATEGORIES]);
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const [settings, setSettings] = useState({
    support_phone: '+91 9598581274',
    business_location: 'Varanasi, Uttar Pradesh',
    whatsapp_number: '9598581274',
    site_name: 'MERCHANT ZONE',
    site_tagline: 'All Digital Payment & Banking Solutions — Smart Payment, Bigger Business',
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/services').then(r => r.json()),
      fetch('/api/settings').then(r => r.json()),
    ])
      .then(([svcData, settingsData]) => {
        if (svcData?.services) {
          setServices(svcData.services);
          const cats = Array.from(new Set(svcData.services.map((s: Service) => s.category))) as string[];
          setCategories([ALL_CATEGORIES, ...cats]);
        }
        if (settingsData?.settings) {
          setSettings(prev => ({ ...prev, ...settingsData.settings }));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = services.filter(service => {
    const matchesCat = activeCategory === ALL_CATEGORIES || service.category === activeCategory;
    const matchesSearch =
      searchQuery === '' ||
      service.service_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Group filtered by category for presentation
  const grouped = filtered.reduce<Record<string, Service[]>>((acc, s) => {
    acc[s.category] = acc[s.category] || [];
    acc[s.category].push(s);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <HeroSection />
      <SolutionsShowcase />
      <DocumentsRequiredSection />

      {/* Services Catalog Section */}
      <section id="services" className="py-20 px-4 bg-slate-950">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <span className="text-amber-400 text-xs font-bold uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full inline-block mb-3">
              Application Catalog
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
              Available Service Applications
            </h2>
            <p className="text-white/50 text-sm max-w-xl mx-auto">
              Select your required service and click <strong className="text-amber-400">&apos;Apply Now&apos;</strong> to proceed directly to the application &amp; payment page.
            </p>
          </div>

          {/* Search bar */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-sm">🔍</span>
              <input
                type="text"
                placeholder="Search services (e.g. MobiKwik, HDFC, Soundbox, FamPay)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="form-input pl-11 text-sm bg-slate-900 border-white/15 focus:border-amber-400"
                aria-label="Search services"
              />
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-10 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`category-tab text-xs sm:text-sm font-semibold whitespace-nowrap px-4 py-2 rounded-xl transition-all ${
                  activeCategory === cat
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-bold'
                    : 'glass text-white/70 hover:text-white border border-white/10'
                }`}
                aria-pressed={activeCategory === cat}
              >
                {cat === ALL_CATEGORIES ? '🌐 All Services' : `${SERVICE_CATEGORY_ICONS[cat] || '🏢'} ${cat}`}
              </button>
            ))}
          </div>

          {/* Services List / Grid */}
          {loading ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="glass h-48 rounded-2xl animate-pulse bg-white/5 border border-white/5"></div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 glass rounded-3xl border border-white/10">
              <p className="text-4xl mb-4">🔍</p>
              <p className="text-white/60 text-base font-semibold">No services found matching your search</p>
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory(ALL_CATEGORIES); }}
                className="mt-4 text-amber-400 hover:text-amber-300 font-bold text-xs underline"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            Object.entries(grouped).map(([category, catServices]) => (
              <div key={category} className="mb-14">
                <div className="flex items-center gap-3 mb-6 pb-3 border-b border-white/10">
                  <span className="text-2xl">{SERVICE_CATEGORY_ICONS[category] || '🏢'}</span>
                  <h3 className="text-xl font-bold text-white">{category}</h3>
                  <span className="badge bg-amber-500/15 text-amber-400 text-xs px-2.5 py-0.5 rounded-full font-bold ml-auto sm:ml-0">
                    {catServices.length} options
                  </span>
                </div>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {catServices.map(service => (
                    <ServiceCard key={service.id} service={service} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <HowItWorksSection />

      <SupportSection
        phone={settings.support_phone}
        location={settings.business_location}
        whatsapp={settings.whatsapp_number}
      />

      <Footer siteName={settings.site_name} location={settings.business_location} />
    </div>
  );
}
