import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
import { validateEmail } from '@project/shared';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        'Login failed. Please check your credentials.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('alice@example.com');
    setPassword('SecurePassword123!');
    setError(null);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-100">Welcome back</h2>
        <p className="text-sm text-slate-400 mt-1">Sign in to your AntiGravity account</p>
      </div>

      {error && (
        <div className="mb-5 p-3.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs leading-relaxed">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
          autoComplete="email"
          required
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4" />}
          autoComplete="current-password"
          required
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full mt-2"
          isLoading={isSubmitting}
          rightIcon={<LogIn className="w-4 h-4" />}
        >
          Sign In
        </Button>
      </form>

      <div className="mt-6 pt-5 border-t border-surface-border/60 flex flex-col gap-3">
        <button
          type="button"
          onClick={handleDemoFill}
          className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors text-center font-medium"
        >
          Use Demo Credentials (alice@example.com)
        </button>

        <p className="text-xs text-center text-slate-400">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1 ml-1"
          >
            Create account <ArrowRight className="w-3 h-3" />
          </Link>
        </p>
      </div>
    </div>
  );
};
