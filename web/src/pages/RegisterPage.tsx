import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Mail, Lock, User, Shield, HardHat } from 'lucide-react';
import { Button } from '../components/Button';
import { ErrorMessage } from '../components/feedback/ErrorMessage';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'supervisor'>('supervisor');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (name.trim().length < 2) {
      setError('Please enter your full name (at least 2 characters).');
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-type password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      });
      navigate(role === 'supervisor' ? '/supervisor/dashboard' : '/admin/dashboard');
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        'Registration failed. An account with this email may already exist.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-5">
        <h2 className="text-lg font-bold text-slate-900">Create AnandHomes Account</h2>
        <p className="text-xs text-slate-500 mt-0.5">Register for operations & construction site access</p>
      </div>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} onDismiss={() => setError(null)} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name *</label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rajesh Kumar"
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0D5C3A] text-slate-800 font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">Email Address *</label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@anandhomes.com"
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0D5C3A] text-slate-800 font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 chars"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0D5C3A] text-slate-800 font-medium"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Confirm Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0D5C3A] text-slate-800 font-medium"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Select Role *</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole('supervisor')}
              className={`py-2 px-3 rounded-lg border text-[11px] font-bold transition-all text-center flex flex-col items-center gap-1 ${
                role === 'supervisor'
                  ? 'border-[#0D5C3A] bg-emerald-50 text-[#0D5C3A] shadow-xs'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <HardHat className="w-4 h-4" />
              <span>Site Supervisor</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`py-2 px-3 rounded-lg border text-[11px] font-bold transition-all text-center flex flex-col items-center gap-1 ${
                role === 'admin'
                  ? 'border-[#0D5C3A] bg-emerald-50 text-[#0D5C3A] shadow-xs'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Super Admin</span>
            </button>
          </div>
        </div>

        <Button
          type="submit"
          variant="brand"
          size="md"
          isLoading={isSubmitting}
          className="w-full mt-2"
        >
          Create Account
        </Button>
      </form>

      <div className="mt-6 pt-4 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="text-[#0D5C3A] hover:underline font-bold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
