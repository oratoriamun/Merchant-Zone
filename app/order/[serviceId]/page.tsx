'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { formatCurrency, needsBankDetails } from '@/lib/utils';
import BrandLogo from '@/components/customer/BrandLogo';

interface Service {
  id: number;
  category: string;
  service_name: string;
  price: number;
}

interface Settings {
  payment_qr_url: string;
  payment_instructions: string;
  refund_policy: string;
  min_payment_amount: string;
  support_phone: string;
  site_name: string;
}

function OrderContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const serviceId = (params?.serviceId as string) || '';
  const queryServiceName = searchParams.get('service');
  const queryPrice = searchParams.get('price');
  const queryCategory = searchParams.get('category');

  // Initial service state from URL params if available
  const [service, setService] = useState<Service | null>(() => {
    if (serviceId && queryServiceName && queryPrice) {
      return {
        id: parseInt(serviceId, 10) || 1,
        service_name: queryServiceName,
        category: queryCategory || 'Merchant Services',
        price: parseInt(queryPrice, 10) || 1500,
      };
    }
    return null;
  });

  const [settings, setSettings] = useState<Settings>({
    payment_qr_url: '/images/payment-qr.jpg',
    payment_instructions: 'Scan the BharatPe QR code using any UPI app (Paytm, Google Pay, PhonePe, BHIM). Complete the payment and note down the 12-digit UTR / Reference number.',
    refund_policy: 'Service processing charges are non-refundable once administrative verification begins.',
    min_payment_amount: '1500',
    support_phone: '+91 9598581274',
    site_name: 'MERCHANT ZONE',
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    customer_name: '',
    mobile: '',
    email: '',
    bank_details: '',
    amount: queryPrice || '',
    transaction_reference: '',
    consent: false,
  });

  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [showReqGuide, setShowReqGuide] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/services').then(r => r.json()),
      fetch('/api/settings').then(r => r.json()),
    ])
      .then(([svcData, settingsData]) => {
        if (svcData?.services) {
          const found = (svcData.services as Service[]).find(
            s => s.id === parseInt(serviceId, 10)
          );
          if (found) {
            setService(found);
            setForm(prev => ({
              ...prev,
              amount: String(found.price),
            }));
          }
        }
        if (settingsData?.settings) {
          setSettings(prev => ({ ...prev, ...settingsData.settings }));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [serviceId]);

  const handleCopyUpi = () => {
    const upiId = 'BHARATPE2L0X0O7J8C90743@unitype';
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(upiId);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2500);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setErrors(prev => ({ ...prev, payment_screenshot: 'Only JPG, PNG, WEBP images allowed' }));
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrors(prev => ({ ...prev, payment_screenshot: 'File size must be under 5MB' }));
      return;
    }

    setScreenshotFile(file);
    setErrors(prev => {
      const copy = { ...prev };
      delete copy.payment_screenshot;
      return copy;
    });

    const reader = new FileReader();
    reader.onload = ev => setScreenshotPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    const minAmount = parseInt(settings.min_payment_amount, 10) || 1500;

    if (!form.customer_name.trim() || form.customer_name.trim().length < 2) {
      errs.customer_name = 'Full name is required (at least 2 characters)';
    }

    if (!form.mobile.trim() || !/^[6-9]\d{9}$/.test(form.mobile.trim())) {
      errs.mobile = 'Enter a valid 10-digit mobile number';
    }

    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = 'Enter a valid email address';
    }

    const amt = parseInt(form.amount, 10);
    if (isNaN(amt) || amt < minAmount) {
      errs.amount = `Amount must be at least ${formatCurrency(minAmount)}`;
    }

    if (!form.transaction_reference.trim() || form.transaction_reference.trim().length < 6) {
      errs.transaction_reference = 'Valid Transaction / UTR reference number is required (min 6 characters)';
    }

    if (!screenshotFile) {
      errs.payment_screenshot = 'Please upload your payment confirmation screenshot';
    }

    if (!form.consent) {
      errs.consent = 'You must confirm the payment declaration to submit';
    }

    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Scroll to the first error element
      const firstError = Object.keys(validationErrors)[0];
      const el = document.getElementById(`field-${firstError}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      const fd = new FormData();
      fd.append('service_id', serviceId || String(service?.id || 1));
      fd.append('customer_name', form.customer_name.trim());
      fd.append('mobile', form.mobile.trim());
      fd.append('email', form.email.trim());
      fd.append('bank_details', form.bank_details.trim());
      fd.append('amount', form.amount || String(service?.price || 1500));
      fd.append('transaction_reference', form.transaction_reference.trim());
      fd.append('consent', String(form.consent));
      if (screenshotFile) {
        fd.append('payment_screenshot', screenshotFile);
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        body: fd,
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.fields) setErrors(data.fields);
        else setErrors({ submit: data.error || 'Submission failed. Please verify details.' });
        setSubmitting(false);
        return;
      }

      // Success -> navigate to success page
      router.push(`/order/success?order=${data.orderNumber}`);
    } catch {
      setErrors({ submit: 'Network connection error. Please try again.' });
      setSubmitting(false);
    }
  };

  if (loading && !service) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Loading service details...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-slate-950">
        <div className="text-center glass p-8 rounded-2xl max-w-md border border-white/10">
          <p className="text-4xl mb-4">⚠️</p>
          <h2 className="text-white text-xl font-bold mb-2">Service Not Found</h2>
          <p className="text-white/50 mb-6">The service you requested is currently unavailable or inactive.</p>
          <Link href="/#services" className="btn-primary inline-flex">
            ← Explore Available Services
          </Link>
        </div>
      </div>
    );
  }

  const showBankFields = needsBankDetails(service.service_name);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4">
      {/* Top Navigation Bar */}
      <header className="max-w-4xl mx-auto mb-8 flex items-center justify-between border-b border-white/10 pb-4">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-sm shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
            MZ
          </div>
          <div>
            <span className="font-black text-white text-lg tracking-tight">MERCHANT ZONE</span>
            <span className="text-[10px] block text-amber-400/80 font-medium -mt-1 uppercase tracking-widest">Digital Solutions</span>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/track" className="text-xs sm:text-sm text-white/60 hover:text-white transition-colors">
            Track Order
          </Link>
          <a href={`tel:${settings.support_phone}`} className="glass text-xs px-3 py-1.5 rounded-lg border border-white/10 text-amber-400 hover:text-amber-300 transition-colors hidden sm:inline-block">
            📞 {settings.support_phone}
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs text-white/50">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link href="/#services" className="hover:text-white transition-colors">Services</Link>
          <span>/</span>
          <span className="text-amber-400 font-medium truncate">{service.service_name}</span>
        </div>

        {/* Selected Service Hero Card */}
        <div className="glass rounded-3xl border border-white/12 p-6 sm:p-8 mb-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-amber-500/10 via-blue-500/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <BrandLogo name={service.service_name} size="lg" className="flex-shrink-0" />
              <div>
                <span className="inline-block text-[11px] font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full mb-1">
                  {service.category}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  {service.service_name}
                </h1>
                <p className="text-white/50 text-xs sm:text-sm mt-0.5">
                  Application &amp; Onboarding Assistance Service
                </p>
              </div>
            </div>

            <div className="sm:text-right bg-white/5 sm:bg-transparent p-4 sm:p-0 rounded-2xl border border-white/10 sm:border-0">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-0.5">Application Service Charge</p>
              <p className="text-3xl sm:text-4xl font-black text-amber-400 tracking-tight">
                {formatCurrency(service.price)}
              </p>
              <p className="text-[11px] text-white/40 mt-1">One-time processing fee</p>
            </div>
          </div>

          {/* Quick Notice toggle */}
          <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-white/60">
              <span className="text-green-400 font-bold">✓</span> Fast Track Processing
              <span className="text-white/20">•</span>
              <span className="text-green-400 font-bold">✓</span> Direct Admin Verification
              <span className="text-white/20">•</span>
              <span className="text-green-400 font-bold">✓</span> 100% Safe &amp; Secure
            </div>
            <button
              type="button"
              onClick={() => setShowReqGuide(!showReqGuide)}
              className="text-amber-400 hover:text-amber-300 font-medium underline flex items-center gap-1"
            >
              📋 {showReqGuide ? 'Hide Document Guide' : 'View Required Documents Guide'}
            </button>
          </div>

          {/* Collapsible Document Guide (Using Attached mz-requirements.jpg) */}
          {showReqGuide && (
            <div className="mt-6 pt-6 border-t border-white/10 animate-fadeIn">
              <div className="grid md:grid-cols-2 gap-6 items-center bg-slate-900/60 p-5 rounded-2xl border border-amber-500/20">
                <div className="space-y-3">
                  <h4 className="text-white font-bold text-sm flex items-center gap-2">
                    <span className="text-amber-400">📄</span> Keep These Documents Ready:
                  </h4>
                  <ul className="space-y-2 text-xs text-white/70">
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px]">1</span>
                      <strong>Aadhaar Card</strong> (Front &amp; Back copy)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px]">2</span>
                      <strong>PAN Card</strong> (Individual or Business)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px]">3</span>
                      <strong>Mobile Number</strong> (Linked with Aadhaar/Bank)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px]">4</span>
                      <strong>Active Email ID</strong> for application correspondence
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px]">5</span>
                      <strong>Bank Account Details</strong> (Passbook / Cancelled Cheque)
                    </li>
                  </ul>
                </div>
                <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-lg max-h-56">
                  <Image
                    src="/images/mz-requirements.jpg"
                    alt="Merchant Zone Documents Required Guide"
                    width={500}
                    height={350}
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Order Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Global Submit Error if any */}
          {errors.submit && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <p>{errors.submit}</p>
            </div>
          )}

          {/* STEP 1: Applicant Information */}
          <section className="glass rounded-3xl border border-white/10 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center font-black text-sm">
                1
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Applicant Information</h2>
                <p className="text-xs text-white/40">Provide your basic contact and application details</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div id="field-customer_name">
                <label className="form-label text-xs">Full Name (As on Aadhaar / PAN) *</label>
                <input
                  type="text"
                  value={form.customer_name}
                  onChange={e => setForm(p => ({ ...p, customer_name: e.target.value }))}
                  placeholder="e.g. Rahul Sharma"
                  className={`form-input ${errors.customer_name ? 'border-red-500' : ''}`}
                />
                {errors.customer_name && (
                  <p className="text-red-400 text-xs mt-1">⚠ {errors.customer_name}</p>
                )}
              </div>

              <div id="field-mobile">
                <label className="form-label text-xs">10-Digit Mobile Number *</label>
                <div className="flex gap-2">
                  <span className="glass border border-white/12 rounded-xl px-3 flex items-center text-white/70 text-xs font-semibold">
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel"
                    value={form.mobile}
                    onChange={e => setForm(p => ({ ...p, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                    placeholder="e.g. 9876543210"
                    className={`form-input flex-1 ${errors.mobile ? 'border-red-500' : ''}`}
                    maxLength={10}
                  />
                </div>
                {errors.mobile && (
                  <p className="text-red-400 text-xs mt-1">⚠ {errors.mobile}</p>
                )}
              </div>

              <div id="field-email" className="sm:col-span-2">
                <label className="form-label text-xs">Email Address *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="e.g. rahul.sharma@example.com"
                  className={`form-input ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1">⚠ {errors.email}</p>
                )}
              </div>

              {showBankFields && (
                <div className="sm:col-span-2">
                  <label className="form-label text-xs">
                    Bank Account / Settlement Account Details (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={form.bank_details}
                    onChange={e => setForm(p => ({ ...p, bank_details: e.target.value }))}
                    placeholder="Bank Name, Account Holder Name, Account Number, IFSC Code (Optional at submission stage)"
                    className="form-input text-xs"
                  />
                  <p className="text-white/40 text-[11px] mt-1">
                    You can also provide bank documentation directly to our representative after order verification.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* STEP 2: Payment Instructions & BharatPe QR */}
          <section className="glass rounded-3xl border border-white/10 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-black text-sm">
                2
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Scan &amp; Pay via UPI</h2>
                <p className="text-xs text-white/40">Pay the service fee using any UPI application</p>
              </div>
            </div>

            <div className="grid md:grid-cols-12 gap-8 items-center bg-slate-900/80 p-6 sm:p-8 rounded-2xl border border-white/8">
              {/* QR Code Container */}
              <div className="md:col-span-5 flex flex-col items-center text-center">
                <div className="bg-white p-3 rounded-2xl shadow-2xl border-4 border-amber-500/30 max-w-[260px] w-full">
                  <Image
                    src={settings.payment_qr_url || '/images/payment-qr.jpg'}
                    alt="BharatPe Payment QR Code"
                    width={400}
                    height={400}
                    priority
                    className="w-full h-auto rounded-xl object-contain"
                  />
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  <p className="text-xs text-green-400 font-semibold uppercase tracking-wider">Active BharatPe QR</p>
                </div>
                <p className="text-[11px] text-white/50 mt-0.5">Payee: NIKHIL SINGH</p>
              </div>

              {/* Instructions and Copy UPI */}
              <div className="md:col-span-7 space-y-4">
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                  <p className="text-amber-300 text-xs font-semibold uppercase tracking-wider">Total Payable Amount</p>
                  <p className="text-3xl font-black text-amber-400 mt-1">
                    {formatCurrency(service.price)}
                  </p>
                  <p className="text-[11px] text-amber-200/70 mt-1">
                    Please ensure the exact amount of {formatCurrency(service.price)} is transferred.
                  </p>
                </div>

                <div>
                  <p className="text-xs text-white/50 mb-1">Official UPI ID:</p>
                  <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-white/12">
                    <code className="text-xs text-amber-300 flex-1 font-mono truncate">
                      BHARATPE2L0X0O7J8C90743@unitype
                    </code>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
                    >
                      {copiedUpi ? '✓ Copied' : 'Copy UPI'}
                    </button>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <p className="text-xs font-semibold text-white/80">Accepted Apps:</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI', 'Cred', 'Amazon Pay'].map(app => (
                      <span key={app} className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg text-white/70">
                        {app}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* STEP 3: Payment Verification Proof */}
          <section className="glass rounded-3xl border border-white/10 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center font-black text-sm">
                3
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Payment Verification Details</h2>
                <p className="text-xs text-white/40">Submit your transaction proof for administrator verification</p>
              </div>
            </div>

            <div className="space-y-6">
              <div id="field-transaction_reference">
                <label className="form-label text-xs">Transaction Reference / UTR Number *</label>
                <input
                  type="text"
                  value={form.transaction_reference}
                  onChange={e => setForm(p => ({ ...p, transaction_reference: e.target.value.trim().toUpperCase() }))}
                  placeholder="e.g. 12-digit UTR Number or UPI Ref ID (e.g. 423859201948)"
                  className={`form-input font-mono text-sm tracking-wider uppercase ${errors.transaction_reference ? 'border-red-500' : ''}`}
                />
                <p className="text-[11px] text-white/40 mt-1">
                  You can find the 12-digit UTR / UPI Ref No. in your UPI app receipt.
                </p>
                {errors.transaction_reference && (
                  <p className="text-red-400 text-xs mt-1">⚠ {errors.transaction_reference}</p>
                )}
              </div>

              {/* Screenshot Upload with Live Preview */}
              <div id="field-payment_screenshot">
                <label className="form-label text-xs">Upload Payment Confirmation Screenshot *</label>
                <div className="border-2 border-dashed border-white/15 rounded-2xl p-6 text-center hover:border-amber-500/50 transition-colors bg-white/2 relative">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  />
                  {screenshotPreview ? (
                    <div className="space-y-3">
                      <div className="relative w-36 h-36 mx-auto rounded-xl overflow-hidden border border-white/20 shadow-xl">
                        <Image
                          src={screenshotPreview}
                          alt="Screenshot preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <p className="text-xs text-green-400 font-medium">
                        ✓ Screenshot uploaded ({screenshotFile?.name})
                      </p>
                      <p className="text-[11px] text-white/40">Click to replace screenshot</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-2xl mx-auto">
                        📸
                      </div>
                      <p className="text-sm font-semibold text-white">
                        Click or drag payment screenshot here
                      </p>
                      <p className="text-xs text-white/40">
                        Supports JPG, PNG, WEBP up to 5MB
                      </p>
                    </div>
                  )}
                </div>
                {errors.payment_screenshot && (
                  <p className="text-red-400 text-xs mt-1">⚠ {errors.payment_screenshot}</p>
                )}
              </div>

              {/* Consent Checkbox */}
              <div id="field-consent" className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.consent}
                    onChange={e => setForm(p => ({ ...p, consent: e.target.checked }))}
                    className="w-5 h-5 mt-0.5 rounded border-white/20 text-amber-500 focus:ring-amber-400 cursor-pointer"
                  />
                  <span className="text-xs text-white/70 leading-relaxed select-none">
                    I confirm that I have transferred{' '}
                    <strong className="text-amber-400">{formatCurrency(service.price)}</strong> for{' '}
                    <strong className="text-white">{service.service_name}</strong> application assistance.
                    I acknowledge that all provided details and payment reference proof are genuine and that this
                    request is subject to administrator review.
                  </span>
                </label>
                {errors.consent && (
                  <p className="text-red-400 text-xs mt-2 ml-8">⚠ {errors.consent}</p>
                )}
              </div>

              {/* Submit CTA Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-base sm:text-lg py-4 px-8 rounded-2xl shadow-xl shadow-amber-500/25 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting Request...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Application Request ({formatCurrency(service.price)})</span>
                      <span className="text-xl">→</span>
                    </>
                  )}
                </button>
                <p className="text-center text-[11px] text-white/40 mt-3">
                  A unique Order ID will be generated upon submission for live status tracking.
                </p>
              </div>
            </div>
          </section>
        </form>
      </main>
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
          <div className="w-12 h-12 rounded-full border-2 border-amber-500 border-t-transparent animate-spin"></div>
        </div>
      }
    >
      <OrderContent />
    </Suspense>
  );
}
