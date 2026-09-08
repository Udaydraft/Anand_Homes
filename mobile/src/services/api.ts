import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse } from '@project/shared';
import { secureStorage } from '../utils/storage';

// Default API URL (can be customized for Android emulator 10.0.2.2 or physical devices)
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

const ACCESS_TOKEN_KEY = 'mg_access_token';
const REFRESH_TOKEN_KEY = 'mg_refresh_token';

export const getAccessToken = async (): Promise<string | null> => {
  return await secureStorage.getItem(ACCESS_TOKEN_KEY);
};

export const setTokens = async (accessToken: string, refreshToken: string): Promise<void> => {
  await Promise.all([
    secureStorage.setItem(ACCESS_TOKEN_KEY, accessToken),
    secureStorage.setItem(REFRESH_TOKEN_KEY, refreshToken),
  ]);
};

export const clearTokens = async (): Promise<void> => {
  await Promise.all([
    secureStorage.removeItem(ACCESS_TOKEN_KEY),
    secureStorage.removeItem(REFRESH_TOKEN_KEY),
    secureStorage.removeItem('mg_user_info'),
  ]);
};

// Request Interceptor: Attach Access Token from SecureStore
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: 401 Token Refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    const isAuthRoute =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/register') ||
      originalRequest?.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = await secureStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        await clearTokens();
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        const response = await axios.post<ApiResponse<{ access_token: string; refresh_token: string }>>(
          `${API_BASE_URL}/auth/refresh`,
          { refresh_token: refreshToken }
        );

        const newTokens = response.data.data;
        await setTokens(newTokens.access_token, newTokens.refresh_token);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newTokens.access_token}`;
        }
        processQueue(null, newTokens.access_token);
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        await clearTokens();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
