import { apiClient } from './api';
import { ApiResponse, Property } from '@project/shared';

export const favoriteService = {
  getFavorites: async (): Promise<Property[]> => {
    const res = await apiClient.get<ApiResponse<Property[]>>('/favorites');
    return res.data.data || [];
  },

  toggleFavorite: async (propertyId: string): Promise<{ favorited: boolean; propertyId: string }> => {
    const res = await apiClient.post<ApiResponse<{ favorited: boolean; propertyId: string }>>(
      `/properties/${propertyId}/favorite`
    );
    return res.data.data!;
  },

  removeFavorite: async (propertyId: string): Promise<void> => {
    await apiClient.delete(`/properties/${propertyId}/favorite`);
  },
};
