import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, LoginPayload, RegisterPayload } from '@project/shared';
import { authService } from '../services/auth.service';
import { getAccessToken, clearTokens } from '../services/api';
import { secureStorage } from '../utils/storage';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginPayload) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = async () => {
    try {
      const freshUser = await authService.getMe();
      setUser(freshUser);
    } catch {
      setUser(null);
      await clearTokens();
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedUserStr = await secureStorage.getItem('mg_user_info');
        if (savedUserStr) {
          try {
            setUser(JSON.parse(savedUserStr));
          } catch {
            // ignore
          }
        }

        const token = await getAccessToken();
        if (token) {
          await refreshProfile();
        }
      } catch (e) {
        console.warn('Auth init failed:', e);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginPayload) => {
    setIsLoading(true);
    try {
      const authData = await authService.login(credentials);
      setUser(authData.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterPayload) => {
    setIsLoading(true);
    try {
      const authData = await authService.register(data);
      setUser(authData.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
