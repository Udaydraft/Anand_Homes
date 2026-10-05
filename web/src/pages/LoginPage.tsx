import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useDashboardContext } from '../context/DashboardContext';
import { authService } from '../services/auth.service';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  HardHat,
  ArrowRight,
  KeyRound,
  CheckCircle2,
  X,
} from 'lucide-react';
import { Button } from '../components/Button';
import { ErrorMessage } from '../components/feedback/ErrorMessage';

export const LoginPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<'admin' | 'supervisor'>('admin');
  const [email, setEmail] = useState('admin@anandhomes.com');
  const [password, setPassword] = useState('Password@123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot / Reset Password Modal State
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [showResetNewPassword, setShowResetNewPassword] = useState(false);
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

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
      setEmail('');
      setPassword('');
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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(null);

    const emailClean = resetEmail.trim().toLowerCase();
    if (!emailClean) {
      setResetError('Please enter your Login ID or Email Address.');
      return;
    }
    if (resetNewPassword.length < 6) {
      setResetError('New password must be at least 6 characters long.');
      return;
    }
    if (resetNewPassword !== resetConfirmPassword) {
      setResetError('Passwords do not match. Please verify and re-type.');
      return;
    }

    try {
      setResetSubmitting(true);
      const res = await authService.forgotPassword({
        email: emailClean,
        new_password: resetNewPassword,
      });
      setResetSuccess(res?.message || 'Password reset successfully! You can now log in.');
      setEmail(emailClean);
      setPassword(resetNewPassword);
      setTimeout(() => {
        setShowResetModal(false);
        setResetSuccess(null);
        setResetNewPassword('');
        setResetConfirmPassword('');
      }, 2000);
    } catch (err: any) {
      setResetError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Could not reset password. Please verify your Login ID or Email.'
      );
    } finally {
      setResetSubmitting(false);
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

        {/* Role indicator & Forgot password */}
        <div className="flex justify-between items-center text-[11px] text-slate-500">
          <span>Active Role: <strong className="text-slate-800 capitalize">{selectedRole === 'admin' ? 'Super Admin' : 'Site Supervisor'}</strong></span>
          <button
            type="button"
            onClick={() => {
              setResetEmail(email);
              setShowResetModal(true);
            }}
            className="text-[#0D5C3A] font-bold hover:underline"
          >
            Forgot Password?
          </button>
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

      <div className="mt-4 pt-4 border-t border-slate-100 text-center space-y-2">
        <p className="text-xs text-slate-500">
          New Team Member?{' '}
          <Link to="/register" className="text-[#0D5C3A] hover:underline font-bold">
            Create Account
          </Link>
        </p>
        <p className="text-[11px] text-slate-400">
          By signing in, you agree to our{' '}
          <Link to="/terms" className="text-slate-600 hover:text-[#0D5C3A] underline font-medium">
            Terms & Conditions
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="text-slate-600 hover:text-[#0D5C3A] underline font-medium">
            Privacy Policy
          </Link>
        </p>
      </div>

      {/* Forgot / Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#0D5C3A] flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Reset Password</h3>
                  <p className="text-[11px] text-slate-500">Set a new password for your account</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowResetModal(false);
                  setResetError(null);
                  setResetSuccess(null);
                }}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {resetSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold text-center space-y-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                <p>{resetSuccess}</p>
                <p className="text-[10px] text-emerald-700">Redirecting to sign-in...</p>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-3.5 text-xs">
                {resetError && <ErrorMessage message={resetError} />}

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Login ID or Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="e.g. karthik.raja or supervisor@anandhomes.com"
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0D5C3A] text-slate-800 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    New Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showResetNewPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={resetNewPassword}
                      onChange={(e) => setResetNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-9 pr-9 py-2 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0D5C3A] text-slate-800 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetNewPassword(!showResetNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showResetNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showResetNewPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={resetConfirmPassword}
                      onChange={(e) => setResetConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0D5C3A] text-slate-800 font-medium"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowResetModal(false);
                      setResetError(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="brand"
                    size="sm"
                    isLoading={resetSubmitting}
                  >
                    Update Password
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
