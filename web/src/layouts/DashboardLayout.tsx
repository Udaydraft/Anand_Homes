import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loading } from '../components/Loading';
import { Layers, LayoutDashboard, User as UserIcon, LogOut, ShieldCheck } from 'lucide-react';
import { cn } from '../utils/cn';

export const DashboardLayout: React.FC = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (isLoading) {
    return <Loading fullScreen label="Checking authentication status..." />;
  }

  if (!isAuthenticated) {
    navigate('/login', { replace: true });
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Profile', path: '/profile', icon: <UserIcon className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-surface-border bg-surface/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
                <Layers className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg tracking-tight">AntiGravity</span>
            </Link>

            {/* Nav links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={cn(
                      'flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                      isActive
                        ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-surface-elevated'
                    )}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right User Bar */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-elevated border border-surface-border text-xs text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="capitalize">{user?.role || 'User'}</span>
            </div>

            <div className="flex items-center gap-3 pl-2 border-l border-surface-border/50">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-200 leading-tight">{user?.name}</p>
                <p className="text-xs text-slate-400">{user?.email}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};
