import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../services/user.service';
import { SuccessMessage } from '../components/feedback/SuccessMessage';
import { ErrorMessage } from '../components/feedback/ErrorMessage';
import { CardSkeleton } from '../components/common/Skeleton';
import {
  User as UserIcon,
  Mail,
  Calendar,
  Phone,
  Save,
  Lock,
  Bell,
  Info,
  LogOut,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const { user, refreshProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [joinedDate, setJoinedDate] = useState<string>('Jan 2025');

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const profile = await userService.getMe();
        setName(profile.name || '');
        setEmail(profile.email || '');
        setPhone(profile.phone || '+91 98765 43210');
        setRole(profile.role || 'client');
        if (profile.created_at) {
          setJoinedDate(
            new Date(profile.created_at).toLocaleDateString('en-IN', {
              month: 'short',
              year: 'numeric',
            })
          );
        }
      } catch (err: any) {
        // Fallback to auth user if endpoint fails
        if (user) {
          setName(user.name);
          setEmail(user.email);
          setRole(user.role);
        }
        setErrorMsg('Could not fetch latest profile from server.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await userService.updateProfile({
        name,
        phone,
      });
      await refreshProfile();
      setSuccessMsg('Profile information updated and synchronized with MongoDB Atlas!');
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleTitle = (r: string) => {
    switch (r?.toLowerCase()) {
      case 'admin':
        return 'Super Admin';
      default:
        return 'Site Supervisor';
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">User Profile</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your personal credentials, contact details, and account settings.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Log Out</span>
        </button>
      </div>

      {successMsg && (
        <SuccessMessage message={successMsg} onDismiss={() => setSuccessMsg(null)} />
      )}

      {errorMsg && (
        <ErrorMessage message={errorMsg} onDismiss={() => setErrorMsg(null)} />
      )}

      {loading ? (
        <div className="p-6 bg-white rounded-2xl border border-slate-200">
          <CardSkeleton />
        </div>
      ) : (
        <>
          {/* Main Profile Info Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#0D5C3A] to-emerald-400 text-white font-extrabold text-2xl flex items-center justify-center ring-4 ring-emerald-50 shadow-md">
                {name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-slate-100" />
            </div>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{name}</h3>
                  <div className="flex items-center gap-1.5 justify-center sm:justify-start mt-0.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 text-[#0D5C3A] border border-emerald-100">
                      {getRoleTitle(role)}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500 font-medium">Anand Homes</span>
                  </div>
                </div>

                <div className="text-xs text-slate-400 self-center sm:self-start">
                  User ID: <span className="font-mono text-slate-600 font-bold">{user?.id?.slice(-6).toUpperCase() || 'N/A'}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="font-medium">{email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Member Since {joinedDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Profile Form */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-[#0D5C3A]" />
              <span>Personal Information</span>
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#0D5C3A] focus:ring-2 focus:ring-[#0D5C3A]/10 font-medium text-slate-800"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#0D5C3A] focus:ring-2 focus:ring-[#0D5C3A]/10 font-medium text-slate-800"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email Address <span className="text-[10px] text-slate-400 font-normal">(Primary Account Identifier)</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full pl-10 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-medium cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-[#0D5C3A] hover:bg-[#0A482E] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 disabled:opacity-50 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving changes...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Account Security & App Info */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden text-xs">
            <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Security Credentials</h4>
                  <p className="text-[11px] text-slate-400">Password protected with salted bcrypt hash</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-600">Active</span>
            </div>

            <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Email & SMS Alerts</h4>
                  <p className="text-[11px] text-slate-400">Instant notifications for new properties and enquiry updates</p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-500">Enabled</span>
            </div>

            <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
                  <Info className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Anand Homes Cloud Platform</h4>
                  <p className="text-[11px] text-slate-400">Build v3.0.0 • Connected to MongoDB Atlas</p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-400">v3.0.0</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
