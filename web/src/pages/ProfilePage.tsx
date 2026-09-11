import React, { useState } from 'react';
import { useDashboardContext } from '../context/DashboardContext';
import {
  User,
  Mail,
  Shield,
  Calendar,
  Lock,
  Bell,
  HelpCircle,
  Info,
  LogOut,
  HardHat,
  CheckCircle2,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { roleMode, setRoleMode, selectedSite } = useDashboardContext();
  const [successMsg, setSuccessMsg] = useState(false);

  const name = roleMode === 'admin' ? 'Admin User' : 'Rajesh Kumar';
  const roleTitle = roleMode === 'admin' ? 'Super Admin' : 'Site Supervisor';
  const email = roleMode === 'admin' ? 'admin@anandhomes.com' : 'rajesh.k@anandhomes.com';
  const phone = '98765 43210';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">User Profile</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Account details, site assignments, and notification preferences
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Profile settings updated successfully!</span>
        </div>
      )}

      {/* Main Profile Info Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
        <div className="relative">
          <img
            src={
              roleMode === 'admin'
                ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80'
                : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80'
            }
            alt={name}
            className="w-20 h-20 rounded-full object-cover ring-4 ring-emerald-50 shadow-md"
          />
          <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white" />
        </div>

        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold text-slate-900">{name}</h3>
              <p className="text-xs text-slate-500 font-medium">
                {roleTitle} {roleMode === 'supervisor' && `• ${selectedSite}`}
              </p>
            </div>

            <button
              onClick={() => setRoleMode(roleMode === 'admin' ? 'supervisor' : 'admin')}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-[#0D5C3A] transition-colors self-center sm:self-start"
            >
              Switch to {roleMode === 'admin' ? 'Supervisor Mode' : 'Admin Mode'}
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>{email}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Joined Jan 2025</span>
            </div>
          </div>
        </div>
      </div>

      {/* Menu / Settings List (Matching Image 3 Screen 14 & Image 4 Screen 14) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden text-xs">
        <div className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 text-[#0D5C3A]">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800">Personal Information</h4>
              <p className="text-[11px] text-slate-400">Update name, phone number, and avatar</p>
            </div>
          </div>
          <span className="text-slate-400 font-bold">&gt;</span>
        </div>

        <div className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800">Change Password</h4>
              <p className="text-[11px] text-slate-400">Manage security credentials and 2FA</p>
            </div>
          </div>
          <span className="text-slate-400 font-bold">&gt;</span>
        </div>

        <div className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800">Notification Settings</h4>
              <p className="text-[11px] text-slate-400">Push notifications and low stock SMS alerts</p>
            </div>
          </div>
          <span className="text-slate-400 font-bold">&gt;</span>
        </div>

        <div className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800">Help & Support</h4>
              <p className="text-[11px] text-slate-400">Contact IT helpdesk or supervisor lead</p>
            </div>
          </div>
          <span className="text-slate-400 font-bold">&gt;</span>
        </div>

        <div className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800">About App</h4>
              <p className="text-[11px] text-slate-400">Anand Homes v2.4.0 (Build 2025.05)</p>
            </div>
          </div>
          <span className="text-slate-400 font-bold">&gt;</span>
        </div>
      </div>
    </div>
  );
};
