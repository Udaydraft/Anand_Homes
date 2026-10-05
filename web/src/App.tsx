import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './hooks/useAuth';
import { DashboardProvider } from './context/DashboardContext';
import { AuthLayout } from './layouts/AuthLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import {
  LoginPage,
  RegisterPage,
  DashboardPage,
  AdminDashboard,
  SupervisorDashboard,
  ProfilePage,
  MySitePage,
  InventoryPage,
  ReportsPage,
  LowStockAlertsPage,
  ProjectMasterPage,
  SupervisorMasterPage,
  ProjectDurationPage,
  InventoryMasterPage,
  InwardMaterialPage,
  OutwardMaterialPage,
  MaterialRequestsPage,
  LabourEntryPage,
  PrivacyPolicyPage,
  TermsConditionsPage,
} from './pages';

import {
  NotFound,
  Unauthorized,
  Forbidden,
  ServerError,
  NetworkError,
  Maintenance,
} from './components/errors';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DashboardProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Auth & Legal Routes */}
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/privacy-policy" element={<Navigate to="/privacy" replace />} />
              <Route path="/terms" element={<TermsConditionsPage />} />
              <Route path="/terms-and-conditions" element={<Navigate to="/terms" replace />} />

              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Route>

              {/* Protected Authenticated Workflow & Management Routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/supervisor/dashboard" element={<SupervisorDashboard />} />
                <Route path="/projects" element={<ProjectMasterPage />} />
                <Route path="/supervisors" element={<Navigate to="/projects?tab=supervisors" replace />} />
                <Route path="/project-duration" element={<Navigate to="/projects?tab=durations" replace />} />
                <Route path="/inventory-master" element={<Navigate to="/inventory" replace />} />
                <Route path="/material-inward" element={<InwardMaterialPage />} />
                <Route path="/material-outward" element={<OutwardMaterialPage />} />
                <Route path="/material-requests" element={<MaterialRequestsPage />} />
                <Route path="/labour-entry" element={<LabourEntryPage />} />
                <Route path="/sites" element={<Navigate to="/projects" replace />} />
                <Route path="/my-site" element={<MySitePage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/low-stock" element={<LowStockAlertsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/users" element={<Navigate to="/supervisors" replace />} />
                <Route path="/settings" element={<ProfilePage />} />
                <Route path="/notifications" element={<LowStockAlertsPage />} />
              </Route>

              {/* Dedicated Error / System Routes */}
              <Route path="/401" element={<Unauthorized />} />
              <Route path="/403" element={<Forbidden />} />
              <Route path="/500" element={<ServerError />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/network-error" element={<NetworkError />} />
              <Route path="/404" element={<NotFound />} />

              {/* Catch-all renders 404 NotFound Page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </DashboardProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
