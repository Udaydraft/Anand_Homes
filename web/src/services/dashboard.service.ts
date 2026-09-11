import { apiClient } from './api';
import { ApiResponse, NotificationItem, UnifiedDashboardData } from '@project/shared';

export const dashboardService = {
  getDashboardData: async (): Promise<UnifiedDashboardData> => {
    const res = await apiClient.get<ApiResponse<UnifiedDashboardData>>('/dashboard');
    return res.data.data!;
  },

  getNotifications: async (): Promise<NotificationItem[]> => {
    const res = await apiClient.get<ApiResponse<NotificationItem[]>>('/notifications');
    return res.data.data || [];
  },
};
