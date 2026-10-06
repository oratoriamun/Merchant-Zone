import React from 'react';

interface BrandLogoProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function BrandLogo({ name, size = 'md', className = '' }: BrandLogoProps) {
  const n = name.toLowerCase();

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
  }[size];

  // MobiKwik
  if (n.includes('mobikwik')) {
    return (
      <div className={`${sizeClasses} rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center font-black text-white shadow-md shadow-blue-500/20 ${className}`}>
        <span className="tracking-tighter">M<span className="text-cyan-200">K</span></span>
      </div>
    );
  }

  // Amazon Pay
  if (n.includes('amazon')) {
    return (
      <div className={`${sizeClasses} rounded-xl bg-slate-900 border border-amber-500/30 flex flex-col items-center justify-center font-bold text-amber-400 shadow-md shadow-amber-500/10 ${className}`}>
        <span className="text-[10px] leading-none text-white font-semibold">amazon</span>
        <span className="text-[11px] leading-tight text-amber-400 font-extrabold">pay</span>
      </div>
    );
  }

  // FamPay
  if (n.includes('fampay')) {
    return (
      <div className={`${sizeClasses} rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center font-black text-slate-950 shadow-md shadow-amber-500/20 ${className}`}>
        <span className="text-lg">⚡</span>
      </div>
    );
  }

  // Google Pay / GPay
  if (n.includes('gpay') || n.includes('google')) {
    return (
      <div className={`${sizeClasses} rounded-xl bg-white flex items-center justify-center font-bold shadow-md shadow-blue-500/10 ${className}`}>
        <div className="flex items-center text-xs font-black">
          <span className="text-blue-500">G</span>
          <span className="text-red-500">P</span>
          <span className="text-amber-500">a</span>
          <span className="text-green-500">y</span>
        </div>
      </div>
    );
  }

  // PhonePe
  if (n.includes('phonepe')) {
    return (
      <div className={`${sizeClasses} rounded-xl bg-gradient-to-br from-purple-700 to-indigo-800 flex items-center justify-center font-black text-white shadow-md shadow-purple-600/30 ${className}`}>
        <span className="text-lg">पे</span>
      </div>
    );
  }

  // Paytm
  if (n.includes('paytm')) {
    return (
      <div className={`${sizeClasses} rounded-xl bg-[#002e6e] flex items-center justify-center font-black text-white border border-cyan-400/30 shadow-md shadow-cyan-500/20 ${className}`}>
        <span className="text-[10px] tracking-tight text-white font-extrabold">pay<span className="text-cyan-400">tm</span></span>
      </div>
    );
  }

  // BharatPe
  if (n.includes('bharatpe')) {
    return (
      <div className={`${sizeClasses} rounded-xl bg-slate-900 border border-teal-500/40 flex items-center justify-center font-black text-white shadow-md shadow-teal-500/20 ${className}`}>
        <div className="text-center leading-none">
          <span className="text-[9px] text-teal-400 block font-bold">Bharat</span>
          <span className="text-[11px] text-coral-400 text-rose-400 font-black">Pe</span>
        </div>
      </div>
    );
  }

  // Pine Labs
  if (n.includes('pine labs') || n.includes('pinelabs')) {
    return (
      <div className={`${sizeClasses} rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center font-black text-white shadow-md shadow-emerald-500/20 ${className}`}>
        <span className="text-xs font-black tracking-wider text-emerald-200">PINE</span>
      </div>
    );
  }

  // Mosambee
  if (n.includes('mosambee') || n.includes('mosambi')) {
    return (
      <div className={`${sizeClasses} rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center font-black text-white shadow-md shadow-orange-500/20 ${className}`}>
        <span className="text-sm font-black">MSP</span>
      </div>
    );
  }

  // Airtel
  if (n.includes('airtel')) {
    return (
      <div className={`${sizeClasses} rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center font-black text-white shadow-md shadow-red-500/20 ${className}`}>
        <span className="text-xs font-bold tracking-tight">airtel</span>
      </div>
    );
  }

  // Jio
  if (n.includes('jio')) {
    return (
      <div className={`${sizeClasses} rounded-xl bg-gradient-to-br from-blue-700 to-blue-900 flex items-center justify-center font-black text-white shadow-md shadow-blue-500/20 ${className}`}>
        <span className="text-sm font-black">Jio</span>
      </div>
    );
  }

  // NSDL
  if (n.includes('nsdl')) {
    return (
      <div className={`${sizeClasses} rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center font-black text-amber-100 shadow-md shadow-amber-600/20 ${className}`}>
        <span className="text-xs font-extrabold tracking-wider">NSDL</span>
      </div>
    );
  }

  // SBI
  if (n.includes('sbi') || n.includes('state bank')) {
    return (
      <div className={`${sizeClasses} rounded-xl bg-[#280071] border border-blue-400/30 flex items-center justify-center font-black text-cyan-300 shadow-md shadow-blue-500/20 ${className}`}>
        <span className="text-xs font-black tracking-wider">SBI</span>
      </div>
    );
  }

  // BOB (Bank of Baroda)
  if (n.includes('baroda') || n.includes('bob')) {
    return (
      <div className={`${sizeClasses} rounded-xl bg-gradient-to-br from-orange-600 to-amber-600 flex items-center justify-center font-black text-white shadow-md shadow-orange-500/20 ${className}`}>
        <span className="text-xs font-black tracking-wider">BOB</span>
      </div>
    );
  }

  // Union Bank
  if (n.includes('union')) {
    return (
      <div className={`${sizeClasses} rounded-xl bg-gradient-to-br from-red-600 to-blue-700 flex items-center justify-center font-black text-white shadow-md shadow-red-500/20 ${className}`}>
        <span className="text-[10px] font-black tracking-tight">UNION</span>
      </div>
    );
  }

  // Bank of Maharashtra
  if (n.includes('maharashtra')) {
    return (
      <div className={`${sizeClasses} rounded-xl bg-gradient-to-br from-blue-800 to-indigo-900 border border-blue-400/20 flex items-center justify-center font-black text-blue-200 shadow-md shadow-blue-500/20 ${className}`}>
        <span className="text-[10px] font-black tracking-tight">BOM</span>
      </div>
    );
  }

  // Bank of India
  if (n.includes('bank of india') || n.includes('boi')) {
    return (
      <div className={`${sizeClasses} rounded-xl bg-gradient-to-br from-blue-900 to-indigo-950 border border-amber-500/30 flex items-center justify-center font-black text-amber-400 shadow-md shadow-blue-500/20 ${className}`}>
        <span className="text-[11px] font-black">★ BOI</span>
      </div>
    );
  }

  // HDFC
  if (n.includes('hdfc')) {
    return (
      <div className={`${sizeClasses} rounded-xl bg-[#004c8f] border border-red-500/40 flex items-center justify-center font-black text-white shadow-md shadow-blue-500/20 ${className}`}>
        <div className="flex items-center text-[11px] font-black tracking-tight">
          <span className="text-white">HD</span>
          <span className="text-red-400">FC</span>
        </div>
      </div>
    );
  }

  // ICICI
  if (n.includes('icici')) {
    return (
      <div className={`${sizeClasses} rounded-xl bg-gradient-to-br from-orange-600 to-amber-700 flex items-center justify-center font-black text-white shadow-md shadow-orange-500/20 ${className}`}>
        <span className="text-xs font-black tracking-wider">ICICI</span>
      </div>
    );
  }

  // Default fallback
  return (
    <div className={`${sizeClasses} rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-bold text-white shadow-md ${className}`}>
      <span>MZ</span>
    </div>
  );
}

export { BrandLogo };
