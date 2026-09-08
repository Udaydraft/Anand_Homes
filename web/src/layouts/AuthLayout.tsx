import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Layers } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background relative flex flex-col justify-center items-center px-4 py-12 selection:bg-indigo-500 selection:text-white">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="mb-8 flex flex-col items-center text-center relative z-10">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform duration-200">
            <Layers className="w-6 h-6" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            AntiGravity
          </span>
        </Link>
        <p className="text-sm text-slate-400 mt-2">Unified Web + Mobile Architecture</p>
      </div>

      {/* Auth Card Container */}
      <div className="w-full max-w-md relative z-10">
        <div className="glass-panel rounded-2xl p-8 shadow-2xl border border-white/10">
          <Outlet />
        </div>
      </div>

      {/* Footer info */}
      <div className="mt-8 text-center text-xs text-slate-500 relative z-10">
        Connected to FastAPI Backend &bull; MongoDB Atlas Ready
      </div>
    </div>
  );
};
