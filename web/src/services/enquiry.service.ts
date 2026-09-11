import { apiClient } from './api';
import { ApiResponse, Enquiry, EnquiryCreatePayload } from '@project/shared';

export const enquiryService = {
  getEnquiries: async (): Promise<Enquiry[]> => {
    const res = await apiClient.get<ApiResponse<Enquiry[]>>('/enquiries');
    return res.data.data || [];
  },

  submitEnquiry: async (payload: EnquiryCreatePayload): Promise<Enquiry> => {
    const res = await apiClient.post<ApiResponse<Enquiry>>('/enquiries', payload);
    return res.data.data!;
  },

  updateStatus: async (enquiryId: string, status: string, agentNotes?: string): Promise<Enquiry> => {
    const res = await apiClient.patch<ApiResponse<Enquiry>>(`/enquiries/${enquiryId}/status`, {
      status,
      agentNotes,
    });
    return res.data.data!;
  },
};
