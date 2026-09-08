import { apiClient, setTokens, clearTokens } from './api';
import {
  ApiResponse,
  AuthResponse,
  AuthTokens,
  HealthResponse,
  LoginPayload,
  RegisterPayload,
  User,
} from '@project/shared';

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', payload);
    const data = res.data.data;
    setTokens(data.tokens.access_token, data.tokens.refresh_token);
    localStorage.setItem('user_info', JSON.stringify(data.user));
    return data;
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', payload);
    const data = res.data.data;
    setTokens(data.tokens.access_token, data.tokens.refresh_token);
    localStorage.setItem('user_info', JSON.stringify(data.user));
    return data;
  },

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const res = await apiClient.post<ApiResponse<AuthTokens>>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    const tokens = res.data.data;
    setTokens(tokens.access_token, tokens.refresh_token);
    return tokens;
  },

  async getMe(): Promise<User> {
    const res = await apiClient.get<ApiResponse<User>>('/auth/me');
    const user = res.data.data;
    localStorage.setItem('user_info', JSON.stringify(user));
    return user;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post<ApiResponse<Record<string, any>>>('/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      clearTokens();
    }
  },

  async checkHealth(): Promise<HealthResponse> {
    const res = await apiClient.get<HealthResponse>('/health', {
      // strip /api prefix from baseURL for root /health if needed, or call directly
      baseURL: import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:8000',
    });
    return res.data;
  },
};
