import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Mail, Lock, User as UserIcon, UserPlus, ArrowLeft } from 'lucide-react';
import { validateEmail, validatePassword, validateName } from '@project/shared';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const nameVal = validateName(name);
    if (!nameVal.isValid) {
      setError(nameVal.message || 'Please enter a valid name.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    const pwdVal = validatePassword(password);
    if (!pwdVal.isValid) {
      setError(pwdVal.message || 'Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({ name, email, password });
      navigate('/dashboard');
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        'Registration failed. Please check your information.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-100">Create your account</h2>
        <p className="text-sm text-slate-400 mt-1">Get started with unified web and mobile access</p>
      </div>

      {error && (
        <div className="mb-5 p-3.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs leading-relaxed">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <Input
          label="Full Name"
          type="text"
          placeholder="Jane Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          leftIcon={<UserIcon className="w-4 h-4" />}
          required
        />

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
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4" />}
          autoComplete="new-password"
          required
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="Re-enter password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4" />}
          autoComplete="new-password"
          required
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full mt-3"
          isLoading={isSubmitting}
          rightIcon={<UserPlus className="w-4 h-4" />}
        >
          Create Account
        </Button>
      </form>

      <div className="mt-6 pt-5 border-t border-surface-border/60">
        <p className="text-xs text-center text-slate-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1 ml-1"
          >
            <ArrowLeft className="w-3 h-3" /> Sign in instead
          </Link>
        </p>
      </div>
    </div>
  );
};
