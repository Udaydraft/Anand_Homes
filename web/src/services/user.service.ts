import { apiClient } from './api';
import { ApiResponse, User, UserProfileUpdate } from '@project/shared';

export const userService = {
  async getProfile(): Promise<User> {
    const res = await apiClient.get<ApiResponse<User>>('/users/me');
    return res.data.data!;
  },

  async getMe(): Promise<User> {
    const res = await apiClient.get<ApiResponse<User>>('/users/me');
    return res.data.data!;
  },

  async updateProfile(data: UserProfileUpdate): Promise<User> {
    const res = await apiClient.put<ApiResponse<User>>('/users/me', data);
    return res.data.data!;
  },

  async listUsers(role?: string): Promise<User[]> {
    const params = role ? { role } : {};
    const res = await apiClient.get<ApiResponse<User[]>>('/users', { params });
    return res.data.data || [];
  },

  async createUser(data: { name: string; email: string; password: string; role: 'admin' | 'supervisor' }): Promise<User> {
    const res = await apiClient.post<ApiResponse<User>>('/users', data);
    return res.data.data!;
  },
};
