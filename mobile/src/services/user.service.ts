import { apiClient } from './api';
import { ApiResponse, User, UserProfileUpdate } from '@project/shared';

export const userService = {
  async getProfile(): Promise<User> {
    const res = await apiClient.get<ApiResponse<User>>('/users/profile');
    return res.data.data;
  },

  async updateProfile(data: UserProfileUpdate): Promise<User> {
    const res = await apiClient.put<ApiResponse<User>>('/users/profile', data);
    return res.data.data;
  },
};
