import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useDashboardContext } from '../context/DashboardContext';
import { Mail, Lock, Eye, EyeOff, Shield, HardHat, ArrowRight } from 'lucide-react';
import { Button } from '../components/Button';
import { ErrorMessage } from '../components/feedback/ErrorMessage';

export const LoginPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<'admin' | 'supervisor'>('admin');
  const [email, setEmail] = useState('admin@anandhomes.com');
  const [password, setPassword] = useState('Password@123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const { setRoleMode } = useDashboardContext();
  const navigate = useNavigate();
  const location = useLocation();

  const handleRoleTab = (role: 'admin' | 'supervisor') => {
    setSelectedRole(role);
    if (role === 'admin') {
      setEmail('admin@anandhomes.com');
      setPassword('Password@123');
    } else {
      setEmail('rajesh.k@anandhomes.com');
      setPassword('Password@123');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailTrimmed = email.trim().toLowerCase();
    if (!emailTrimmed) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Determine active role: strictly admin or supervisor
      const activeRole = (selectedRole === 'admin' || emailTrimmed.includes('admin@')) ? 'admin' : 'supervisor';
      setRoleMode(activeRole);
      localStorage.setItem('ah_user_role', activeRole);

      await login({ email: emailTrimmed, password });
      
      const roleTarget = activeRole === 'admin' ? '/admin/dashboard' : '/supervisor/dashboard';
      const fromPath = (location.state as any)?.from?.pathname;
      const target = (fromPath && fromPath !== '/dashboard' && fromPath !== '/admin/dashboard' && fromPath !== '/supervisor/dashboard')
        ? fromPath
        : roleTarget;

      navigate(target, { replace: true });
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        'Invalid email or password. Please verify your credentials.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Title */}
      <div className="text-center mb-5">
        <h2 className="text-lg font-bold text-slate-900">Welcome Back to AnandHomes</h2>
        <p className="text-xs text-slate-500 mt-0.5">Sign in to manage projects, inventory & construction operations</p>
      </div>

      {/* Role Selection Tabs - Strictly Admin and Supervisor */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl mb-4 text-xs">
        <button
          type="button"
          onClick={() => handleRoleTab('admin')}
          className={`py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
            selectedRole === 'admin'
              ? 'bg-[#0D5C3A] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Super Admin</span>
        </button>
        <button
          type="button"
          onClick={() => handleRoleTab('supervisor')}
          className={`py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
            selectedRole === 'supervisor'
              ? 'bg-[#0D5C3A] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <HardHat className="w-4 h-4" />
          <span>Site Supervisor</span>
        </button>
      </div>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} onDismiss={() => setError(null)} />
        </div>
      )}

      {/* Standard Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        {/* Email */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter Email Address"
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0D5C3A] text-slate-800 font-medium"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            Password *
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
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Role indicator */}
        <div className="flex justify-between items-center text-[11px] text-slate-500">
          <span>Active Role: <strong className="text-slate-800 capitalize">{selectedRole === 'admin' ? 'Super Admin' : 'Site Supervisor'}</strong></span>
          <span className="text-[10px] text-slate-400">Password: Password@123</span>
        </div>

        {/* Login Button */}
        <Button
          type="submit"
          variant="brand"
          size="md"
          isLoading={isSubmitting}
          className="w-full mt-2"
        >
          <span>Sign In as {selectedRole === 'admin' ? 'Super Admin' : 'Site Supervisor'}</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
        </Button>
      </form>

      <div className="mt-6 pt-4 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-500">
          New Team Member?{' '}
          <Link to="/register" className="text-[#0D5C3A] hover:underline font-bold">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
};
