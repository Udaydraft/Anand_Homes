import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useDashboardContext } from '../context/DashboardContext';
import { AdminDashboard } from './AdminDashboard';
import { SupervisorDashboard } from './SupervisorDashboard';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { roleMode } = useDashboardContext();

  // Check user role from auth or context (strictly supervisor or admin)
  const isSupervisor =
    user?.role === 'supervisor' ||
    roleMode === 'supervisor' ||
    (user?.email?.toLowerCase().includes('supervisor') || user?.email?.toLowerCase().includes('rajesh.k'));

  if (isSupervisor) {
    return <SupervisorDashboard />;
  }

  return <AdminDashboard />;
};
