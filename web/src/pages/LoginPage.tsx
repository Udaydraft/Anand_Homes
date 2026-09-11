import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useDashboardContext, UserRoleMode } from '../context/DashboardContext';
import { Mail, Lock, Eye, EyeOff, Shield, HardHat, ArrowRight, Zap } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<UserRoleMode>('admin');
  const [email, setEmail] = useState('admin@anandhomes.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const { setRoleMode } = useDashboardContext();
  const navigate = useNavigate();

  // Role Tab switch autofills credentials
  const handleRoleTab = (role: UserRoleMode) => {
    setSelectedRole(role);
    if (role === 'admin') {
      setEmail('admin@anandhomes.com');
      setPassword('password123');
    } else {
      setEmail('supervisor@anandhomes.com');
      setPassword('password123');
    }
  };

  // 1-Click Dummy Login Helper
  const handleDummyLogin = (role: UserRoleMode) => {
    setRoleMode(role);
    localStorage.setItem('ah_user_role', role);
    navigate('/dashboard');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const role: UserRoleMode =
        email.toLowerCase().includes('supervisor') || selectedRole === 'supervisor'
          ? 'supervisor'
          : 'admin';
      setRoleMode(role);
      localStorage.setItem('ah_user_role', role);

      await login({ email, password });
      navigate('/dashboard');
    } catch (err: any) {
      // Seamless demo fallback
      navigate('/dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Title */}
      <div className="text-center mb-5">
        <h2 className="text-lg font-bold text-slate-900">Welcome Back!</h2>
        <p className="text-xs text-slate-500 mt-0.5">Select a role or enter your credentials</p>
      </div>

      {/* Role Selection Tabs */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl mb-4 text-xs">
        <button
          type="button"
          onClick={() => handleRoleTab('admin')}
          className={`py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
            selectedRole === 'admin'
              ? 'bg-[#0D5C3A] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Admin Portal</span>
        </button>
        <button
          type="button"
          onClick={() => handleRoleTab('supervisor')}
          className={`py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
            selectedRole === 'supervisor'
              ? 'bg-[#0D5C3A] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <HardHat className="w-3.5 h-3.5" />
          <span>Supervisor</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          {error}
        </div>
      )}

      {/* Standard Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        {/* Email */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter Email"
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0D5C3A] text-slate-800 font-medium"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password"
              className="w-full pl-9 pr-9 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0D5C3A] text-slate-800 font-medium"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Forgot Password */}
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-slate-400">
            Role: <strong className="text-slate-700 capitalize">{selectedRole}</strong>
          </span>
          <a href="#forgot" className="text-slate-500 hover:text-[#0D5C3A] font-medium">
            Forgot Password?
          </a>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 bg-[#0D5C3A] hover:bg-[#0A482E] text-white font-bold rounded-lg shadow-sm transition-all text-xs flex items-center justify-center gap-2"
        >
          <span>{isSubmitting ? 'Signing in...' : `Login as ${selectedRole === 'admin' ? 'Administrator' : 'Site Supervisor'}`}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* 1-Click Quick Dummy Login Section */}
      <div className="mt-5 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-500 mb-3">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Quick 1-Click Demo Login</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Admin Dummy Button */}
          <button
            type="button"
            onClick={() => handleDummyLogin('admin')}
            className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 hover:border-emerald-300 text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-[#0D5C3A] text-white">
                <Shield className="w-3 h-3" />
              </span>
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-200/60 text-[#0A3925]">
                Full Access
              </span>
            </div>
            <p className="font-bold text-xs text-slate-900 group-hover:text-[#0D5C3A]">
              Admin
            </p>
            <p className="text-[10px] text-slate-500 truncate">
              admin@anandhomes.com
            </p>
          </button>

          {/* Supervisor Dummy Button */}
          <button
            type="button"
            onClick={() => handleDummyLogin('supervisor')}
            className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-50 hover:border-amber-300 text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-[#E5A91E] text-slate-900">
                <HardHat className="w-3 h-3 text-slate-900" />
              </span>
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-200/60 text-amber-900">
                Site Alpha
              </span>
            </div>
            <p className="font-bold text-xs text-slate-900 group-hover:text-amber-800">
              Supervisor
            </p>
            <p className="text-[10px] text-slate-500 truncate">
              Rajesh Kumar
            </p>
          </button>
        </div>
      </div>

      {/* Social Logins */}
      <div className="mt-4 pt-3 border-t border-slate-100 text-center">
        <span className="text-[11px] text-slate-400 font-medium">or continue with</span>
        <div className="flex items-center justify-center gap-3 mt-2.5">
          {/* Google */}
          <button
            type="button"
            onClick={() => handleDummyLogin(selectedRole)}
            className="w-8 h-8 rounded-lg border border-slate-200 hover:border-slate-300 flex items-center justify-center hover:bg-slate-50 transition-colors shadow-xs"
            title="Google Login"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </button>

          {/* Apple */}
          <button
            type="button"
            onClick={() => handleDummyLogin(selectedRole)}
            className="w-8 h-8 rounded-lg border border-slate-200 hover:border-slate-300 flex items-center justify-center hover:bg-slate-50 transition-colors shadow-xs"
            title="Apple Login"
          >
            <svg className="w-3.5 h-3.5 fill-slate-800" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.98.6-2.62 1.35-.57.65-1.07 1.72-.94 2.74 1 .08 2.02-.49 2.64-1.24z" />
            </svg>
          </button>

          {/* Microsoft */}
          <button
            type="button"
            onClick={() => handleDummyLogin(selectedRole)}
            className="w-8 h-8 rounded-lg border border-slate-200 hover:border-slate-300 flex items-center justify-center hover:bg-slate-50 transition-colors shadow-xs"
            title="Microsoft Login"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <rect fill="#F25022" x="1" y="1" width="10" height="10" />
              <rect fill="#7FBA00" x="13" y="1" width="10" height="10" />
              <rect fill="#00A4EF" x="1" y="13" width="10" height="10" />
              <rect fill="#FFB900" x="13" y="13" width="10" height="10" />
            </svg>
          </button>
        </div>

        <p className="text-[11px] text-slate-500 mt-3">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#0D5C3A] hover:underline font-bold">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};
