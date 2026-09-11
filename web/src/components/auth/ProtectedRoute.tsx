import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { PageLoader } from '../common/LoadingState';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader label="Verifying authentication session..." />;
  }

  if (!user) {
    // Redirect unauthenticated user to /login while saving intended target route
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
