import { apiClient } from './api';
import { ApiResponse, Property, PropertyFilterQuery } from '@project/shared';

export const propertyService = {
  getProperties: async (params?: PropertyFilterQuery): Promise<Property[]> => {
    const res = await apiClient.get<ApiResponse<Property[]>>('/properties', { params });
    return res.data.data || [];
  },

  getProperty: async (id: string): Promise<Property | null> => {
    const res = await apiClient.get<ApiResponse<Property>>(`/properties/${id}`);
    return res.data.data || null;
  },

  createProperty: async (payload: Partial<Property>): Promise<Property> => {
    const res = await apiClient.post<ApiResponse<Property>>('/properties', payload);
    return res.data.data!;
  },

  updateProperty: async (id: string, payload: Partial<Property>): Promise<Property> => {
    const res = await apiClient.put<ApiResponse<Property>>(`/properties/${id}`, payload);
    return res.data.data!;
  },

  deleteProperty: async (id: string): Promise<void> => {
    await apiClient.delete(`/properties/${id}`);
  },
};
