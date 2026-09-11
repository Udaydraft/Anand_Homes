import React from 'react';
import { Outlet } from 'react-router-dom';
import { AnandHomesLogo } from '../components/AnandHomesLogo';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#072417] flex flex-col justify-between items-center relative overflow-hidden px-4 py-8 selection:bg-emerald-500 selection:text-white">
      {/* Background Decorative Construction Silhouette & Gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A3925] via-[#072417] to-[#04160E] pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Logo */}
      <div className="relative z-10 pt-4 pb-2">
        <AnandHomesLogo />
      </div>

      {/* Auth Card Container */}
      <div className="w-full max-w-sm relative z-10 my-auto">
        <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-2xl border border-slate-100/20">
          <Outlet />
        </div>
      </div>

      {/* Bottom Construction Skyline Illustration / Footer */}
      <div className="w-full max-w-xl text-center relative z-10 pt-4 pb-2">
        <p className="text-[11px] text-emerald-200/50 font-medium">
          Anand Homes ERP &bull; Construction &bull; Inventory &bull; Logistics
        </p>
      </div>
    </div>
  );
};
