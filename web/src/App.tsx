import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { DashboardProvider } from './context/DashboardContext';
import { AuthLayout } from './layouts/AuthLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { SitesPage } from './pages/SitesPage';
import { MySitePage } from './pages/MySitePage';
import { InventoryPage } from './pages/InventoryPage';
import { StockInPage } from './pages/StockInPage';
import { StockOutPage } from './pages/StockOutPage';
import { MaterialRequestsPage } from './pages/MaterialRequestsPage';
import { DeliveriesPage } from './pages/DeliveriesPage';
import { PhotoMonitoringPage } from './pages/PhotoMonitoringPage';
import { ReportsPage } from './pages/ReportsPage';
import { SiteMapViewPage } from './pages/SiteMapViewPage';
import { LowStockAlertsPage } from './pages/LowStockAlertsPage';

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
              {/* Public Auth Routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Route>

              {/* Authenticated Dashboard Routes */}
              <Route element={<DashboardLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/sites" element={<SitesPage />} />
                <Route path="/my-site" element={<MySitePage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/stock-in" element={<StockInPage />} />
                <Route path="/stock-out" element={<StockOutPage />} />
                <Route path="/material-requests" element={<MaterialRequestsPage />} />
                <Route path="/deliveries" element={<DeliveriesPage />} />
                <Route path="/photo-monitoring" element={<PhotoMonitoringPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/map" element={<SiteMapViewPage />} />
                <Route path="/low-stock" element={<LowStockAlertsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/users" element={<SitesPage />} />
                <Route path="/suppliers" element={<DeliveriesPage />} />
                <Route path="/settings" element={<ProfilePage />} />
                <Route path="/notifications" element={<LowStockAlertsPage />} />
              </Route>

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </DashboardProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
