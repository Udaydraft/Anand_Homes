import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../services/user.service';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { User, Mail, Shield, Calendar, Key, Check } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (name.trim().length < 2) {
      setErrorMessage('Name must be at least 2 characters.');
      return;
    }

    setIsUpdating(true);
    try {
      await userService.updateProfile({ name: name.trim() });
      await refreshProfile();
      setSuccessMessage('Profile updated successfully!');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update profile.';
      setErrorMessage(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  const formattedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Recently';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">User Profile</h1>
        <p className="text-sm text-slate-400 mt-1">Manage your account information and authentication credentials</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <Card className="md:col-span-1 flex flex-col items-center text-center p-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-xl shadow-indigo-500/20 mb-4">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <h3 className="text-lg font-bold text-slate-100">{user?.name}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>

          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            {user?.role || 'user'}
          </div>

          <div className="w-full mt-6 pt-5 border-t border-surface-border/60 text-left space-y-3 text-xs text-slate-400">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" /> Member since
              </span>
              <span className="text-slate-200 font-medium">{formattedDate}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-slate-500" /> Account Status
              </span>
              <span className="text-emerald-400 font-semibold">Active</span>
            </div>
          </div>
        </Card>

        {/* Edit Profile Form */}
        <div className="md:col-span-2 space-y-6">
          <Card title="Account Details" subtitle="Edit your personal details below">
            {successMessage && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4" /> {successMessage}
              </div>
            )}

            {errorMessage && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<User className="w-4 h-4" />}
                required
              />

              <Input
                label="Email Address"
                type="email"
                value={user?.email || ''}
                disabled
                helperText="Email cannot be changed directly in basic profile settings."
                leftIcon={<Mail className="w-4 h-4" />}
              />

              <div className="pt-2 flex justify-end">
                <Button type="submit" variant="primary" isLoading={isUpdating}>
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>

          <Card title="Security & Authentication" subtitle="Bearer Token & Session Overview">
            <div className="space-y-3 text-xs text-slate-400">
              <p>
                Authentication uses JSON Web Tokens (JWT) signed with HS256. Access tokens are valid
                for 30 minutes, and refresh tokens are securely stored in the client session.
              </p>
              <div className="p-3 rounded-lg bg-surface-elevated border border-surface-border text-slate-300 font-mono text-[11px] break-all">
                User ID: {user?.id}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
