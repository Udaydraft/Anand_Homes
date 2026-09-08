import { apiClient, setTokens, clearTokens } from './api';
import { secureStorage } from '../utils/storage';
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
    await setTokens(data.tokens.access_token, data.tokens.refresh_token);
    await secureStorage.setItem('mg_user_info', JSON.stringify(data.user));
    return data;
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', payload);
    const data = res.data.data;
    await setTokens(data.tokens.access_token, data.tokens.refresh_token);
    await secureStorage.setItem('mg_user_info', JSON.stringify(data.user));
    return data;
  },

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const res = await apiClient.post<ApiResponse<AuthTokens>>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    const tokens = res.data.data;
    await setTokens(tokens.access_token, tokens.refresh_token);
    return tokens;
  },

  async getMe(): Promise<User> {
    const res = await apiClient.get<ApiResponse<User>>('/auth/me');
    const user = res.data.data;
    await secureStorage.setItem('mg_user_info', JSON.stringify(user));
    return user;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post<ApiResponse<any>>('/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      await clearTokens();
    }
  },

  async checkHealth(): Promise<HealthResponse> {
    const res = await apiClient.get<HealthResponse>('/health', {
      baseURL: (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/api\/?$/, ''),
    });
    return res.data;
  },
};
