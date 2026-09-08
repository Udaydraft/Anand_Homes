export * from '@project/shared';

export interface AuthContextType {
  user: import('@project/shared').User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: import('@project/shared').LoginPayload) => Promise<void>;
  register: (data: import('@project/shared').RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}
