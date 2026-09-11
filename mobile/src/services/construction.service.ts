import { apiClient } from './api';
import {
  ApiResponse,
  Site,
  InventoryItem,
  MaterialRequest,
  Delivery,
  SitePhoto,
  LowStockAlertItem,
  ActivityItem,
} from '@project/shared';

export interface DashboardSummary {
  totalSites: number;
  activeSites: number;
  totalInventoryValue: number;
  formattedInventoryValue: string;
  totalMaterials: number;
  pendingRequestsCount: number;
  activeDeliveriesCount: number;
  lowStockCount: number;
  criticalAlertsCount: number;
}

export const constructionService = {
  // Sites
  async getSites(): Promise<Site[]> {
    const res = await apiClient.get<ApiResponse<Site[]>>('/sites');
    return res.data.data;
  },

  async getSite(id: string): Promise<Site> {
    const res = await apiClient.get<ApiResponse<Site>>(`/sites/${id}`);
    return res.data.data;
  },

  async createSite(site: Partial<Site>): Promise<Site> {
    const res = await apiClient.post<ApiResponse<Site>>('/sites', site);
    return res.data.data;
  },

  async updateSite(id: string, site: Partial<Site>): Promise<Site> {
    const res = await apiClient.put<ApiResponse<Site>>(`/sites/${id}`, site);
    return res.data.data;
  },

  async deleteSite(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<any>>(`/sites/${id}`);
  },

  // Inventory
  async getInventory(site?: string): Promise<InventoryItem[]> {
    const params = site && site !== 'All Sites' ? { site } : {};
    const res = await apiClient.get<ApiResponse<InventoryItem[]>>('/inventory', { params });
    return res.data.data;
  },

  async getLowStock(site?: string): Promise<LowStockAlertItem[]> {
    const params = site && site !== 'All Sites' ? { site } : {};
    const res = await apiClient.get<ApiResponse<LowStockAlertItem[]>>('/inventory/low-stock', { params });
    return res.data.data;
  },

  // Stock In / Out
  async stockIn(data: {
    site: string;
    material: string;
    quantity: number;
    unit: string;
    supplier: string;
    invoiceNo: string;
    deliveryDate: string;
    notes?: string;
  }) {
    const res = await apiClient.post<ApiResponse<any>>('/stock/in', data);
    return res.data.data;
  },

  async stockOut(data: {
    site: string;
    material: string;
    quantity: number;
    unit: string;
    usedFor: string;
    requestedBy: string;
    notes?: string;
  }) {
    const res = await apiClient.post<ApiResponse<any>>('/stock/out', data);
    return res.data.data;
  },

  // Material Requests
  async getRequests(site?: string, status?: string): Promise<MaterialRequest[]> {
    const params: Record<string, string> = {};
    if (site && site !== 'All Sites') params.site = site;
    if (status && status !== 'all') params.status = status;
    const res = await apiClient.get<ApiResponse<MaterialRequest[]>>('/requests', { params });
    return res.data.data;
  },

  async createRequest(data: {
    site: string;
    material: string;
    quantity: number;
    unit: string;
    requestedBy?: string;
    requiredDate?: string;
    purpose?: string;
    notes?: string;
    attachments?: string;
  }): Promise<MaterialRequest> {
    const res = await apiClient.post<ApiResponse<MaterialRequest>>('/requests', data);
    return res.data.data;
  },

  async updateRequestStatus(id: string, status: 'Pending' | 'Approved' | 'Rejected'): Promise<MaterialRequest> {
    const res = await apiClient.patch<ApiResponse<MaterialRequest>>(`/requests/${id}/status`, { status });
    return res.data.data;
  },

  async deleteRequest(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<any>>(`/requests/${id}`);
  },

  // Deliveries
  async getDeliveries(site?: string): Promise<Delivery[]> {
    const params = site && site !== 'All Sites' ? { site } : {};
    const res = await apiClient.get<ApiResponse<Delivery[]>>('/deliveries', { params });
    return res.data.data;
  },

  async recordDelivery(data: Partial<Delivery>): Promise<Delivery> {
    const res = await apiClient.post<ApiResponse<Delivery>>('/deliveries', data);
    return res.data.data;
  },

  // Photos
  async getPhotos(site?: string, type?: string): Promise<SitePhoto[]> {
    const params: Record<string, string> = {};
    if (site && site !== 'All Sites') params.site = site;
    if (type) params.type = type;
    const res = await apiClient.get<ApiResponse<SitePhoto[]>>('/photos', { params });
    return res.data.data;
  },

  async uploadPhoto(data: {
    title: string;
    site: string;
    type: 'Stock In' | 'Stock Out' | 'Site Progress';
    imageUrl: string;
    uploader?: string;
  }): Promise<SitePhoto> {
    const res = await apiClient.post<ApiResponse<SitePhoto>>('/photos', data);
    return res.data.data;
  },

  // Activities & Summary
  async getActivities(site?: string, limit: number = 20): Promise<ActivityItem[]> {
    const params: Record<string, any> = { limit };
    if (site && site !== 'All Sites') params.site = site;
    const res = await apiClient.get<ApiResponse<ActivityItem[]>>('/activities', { params });
    return res.data.data;
  },

  async getDashboardSummary(site?: string): Promise<DashboardSummary> {
    const params = site && site !== 'All Sites' ? { site } : {};
    const res = await apiClient.get<ApiResponse<DashboardSummary>>('/dashboard/summary', { params });
    return res.data.data;
  },
};
