import React from 'react';
import { Link } from 'react-router-dom';
import { AnandHomesLogo } from '../AnandHomesLogo';
import { ArrowLeft, Home, HelpCircle } from 'lucide-react';

export interface ErrorPageLayoutProps {
  children: React.ReactNode;
  statusCode?: string | number;
}

export const ErrorPageLayout: React.FC<ErrorPageLayoutProps> = ({
  children,
  statusCode,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 select-none">
      {/* Top Header */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between py-2">
        <Link to="/dashboard" className="flex items-center gap-2">
          <AnandHomesLogo />
        </Link>
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 hover:text-[#0D5C3A] transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-md w-full mx-auto my-auto py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto w-full pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 font-medium">
        <p>© {new Date().getFullYear()} Anand Homes Construction Management. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="hover:text-slate-600 transition-colors">Support</Link>
          <span>•</span>
          <Link to="/dashboard" className="hover:text-slate-600 transition-colors">Privacy Policy</Link>
          <span>•</span>
          <Link to="/dashboard" className="hover:text-slate-600 transition-colors">Status</Link>
        </div>
      </footer>
    </div>
  );
};
