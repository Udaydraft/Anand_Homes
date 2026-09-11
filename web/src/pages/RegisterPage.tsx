import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Mail, Lock, User, UserPlus } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'supervisor'>('supervisor');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await register({ name, email, password, role });
      navigate('/dashboard');
    } catch (err: any) {
      navigate('/dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-5">
        <h2 className="text-lg font-bold text-slate-900">Create Account</h2>
        <p className="text-xs text-slate-500 mt-0.5">Join Anand Homes Management System</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 text-xs">
        <div>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0D5C3A] text-slate-800"
            />
          </div>
        </div>

        <div>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0D5C3A] text-slate-800"
            />
          </div>
        </div>

        <div>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0D5C3A] text-slate-800"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Select Role</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole('supervisor')}
              className={`py-1.5 px-3 rounded-lg border text-xs font-bold transition-all ${
                role === 'supervisor'
                  ? 'border-[#0D5C3A] bg-emerald-50 text-[#0D5C3A]'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Site Supervisor
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`py-1.5 px-3 rounded-lg border text-xs font-bold transition-all ${
                role === 'admin'
                  ? 'border-[#0D5C3A] bg-emerald-50 text-[#0D5C3A]'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Super Admin
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 bg-[#0D5C3A] hover:bg-[#0A482E] text-white font-bold rounded-lg shadow-sm transition-all text-xs mt-2"
        >
          {isSubmitting ? 'Registering...' : 'Register Account'}
        </button>
      </form>

      <p className="text-[11px] text-center text-slate-500 mt-4">
        Already have an account?{' '}
        <Link to="/login" className="text-[#0D5C3A] hover:underline font-bold">
          Sign In
        </Link>
      </p>
    </div>
  );
};
