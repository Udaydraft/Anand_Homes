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
  ProjectMaster,
  SupervisorMaster,
  ProjectDuration,
  InventoryMasterItem,
  InwardMaterialEntry,
  OutwardMaterialEntry,
  LabourEntry,
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
    const params = site && site !== 'All Sites' ? { site } : { all_projects: true };
    const res = await apiClient.get<ApiResponse<LowStockAlertItem[]>>('/inventory/low-stock', { params });
    return res.data.data;
  },

  async createInventoryItem(data: Partial<InventoryItem>): Promise<InventoryItem> {
    const res = await apiClient.post<ApiResponse<InventoryItem>>('/inventory', data);
    return res.data.data;
  },

  async updateInventoryItem(id: string, data: Partial<InventoryItem>): Promise<InventoryItem> {
    const res = await apiClient.put<ApiResponse<InventoryItem>>(`/inventory/${id}`, data);
    return res.data.data;
  },

  async deleteInventoryItem(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<any>>(`/inventory/${id}`);
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
    urgency?: string;
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

  async sendMaterialsToSupervisor(
    id: string,
    data?: {
      quantity?: number;
      notes?: string;
      supplierOrStore?: string;
      addStockQuantity?: number;
      supplier?: string;
      invoiceNo?: string;
      unitPrice?: number;
    }
  ): Promise<MaterialRequest> {
    const res = await apiClient.post<ApiResponse<MaterialRequest>>(`/requests/${id}/send-materials`, data || {});
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

  async updateDelivery(id: string, data: Partial<Delivery>): Promise<Delivery> {
    const res = await apiClient.put<ApiResponse<Delivery>>(`/deliveries/${id}`, data);
    return res.data.data;
  },

  async deleteDelivery(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<any>>(`/deliveries/${id}`);
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

  async uploadPhotoFile(file: File): Promise<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<ApiResponse<{ url: string; filename: string }>>(
      '/photos/upload-file',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return res.data.data;
  },

  async getActivities(site?: string, limit: number = 30): Promise<ActivityItem[]> {
    const params: Record<string, any> = { limit };
    if (site && site !== 'All Sites') params.site = site;
    const res = await apiClient.get<ApiResponse<ActivityItem[]>>('/activities', { params });
    return res.data.data;
  },

  async createActivity(data: {
    text: string;
    site: string;
    type?: string;
    subtext?: string;
    actor?: string;
    targetRole?: string;
    words?: string;
  }): Promise<ActivityItem> {
    const res = await apiClient.post<ApiResponse<ActivityItem>>('/activities', data);
    return res.data.data;
  },

  async getDashboardSummary(site?: string): Promise<DashboardSummary> {
    const params = site && site !== 'All Sites' ? { site } : {};
    const res = await apiClient.get<ApiResponse<DashboardSummary>>('/dashboard/summary', { params });
    return res.data.data;
  },

  // Real-Time Reports
  async getReportData(reportType: string, site?: string): Promise<any> {
    const params = site && site !== 'All Sites' ? { site } : {};
    const res = await apiClient.get<ApiResponse<any>>(`/reports/${reportType}`, { params });
    return res.data.data;
  },

  async downloadReportCsv(reportType: string, site?: string): Promise<Blob> {
    const params = site && site !== 'All Sites' ? { site } : {};
    const res = await apiClient.get(`/reports/${reportType}/download`, {
      params,
      responseType: 'blob',
    });
    return res.data;
  },

  // -------------------------------------------------------------------------
  // Key Screens: 1 & 2. Project Master
  // -------------------------------------------------------------------------
  async getProjectsMaster(): Promise<ProjectMaster[]> {
    const res = await apiClient.get<ApiResponse<ProjectMaster[]>>('/projects');
    return res.data.data;
  },

  async createProjectMaster(data: { projectName: string; siteName: string; status?: string }): Promise<ProjectMaster> {
    const res = await apiClient.post<ApiResponse<ProjectMaster>>('/projects', data);
    return res.data.data;
  },

  async updateProjectMaster(id: string, data: Partial<ProjectMaster>): Promise<ProjectMaster> {
    const res = await apiClient.put<ApiResponse<ProjectMaster>>(`/projects/${id}`, data);
    return res.data.data;
  },

  async deleteProjectMaster(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<any>>(`/projects/${id}`);
  },

  // -------------------------------------------------------------------------
  // Key Screens: 3. Supervisor Master
  // -------------------------------------------------------------------------
  async getSupervisorsMaster(): Promise<SupervisorMaster[]> {
    const res = await apiClient.get<ApiResponse<SupervisorMaster[]>>('/supervisors');
    return res.data.data;
  },

  async createSupervisorMaster(data: {
    name: string;
    loginId: string;
    password?: string;
    project: string;
    site: string;
  }): Promise<SupervisorMaster> {
    const res = await apiClient.post<ApiResponse<SupervisorMaster>>('/supervisors', data);
    return res.data.data;
  },

  async updateSupervisorMaster(id: string, data: Partial<SupervisorMaster>): Promise<SupervisorMaster> {
    const res = await apiClient.put<ApiResponse<SupervisorMaster>>(`/supervisors/${id}`, data);
    return res.data.data;
  },

  async deleteSupervisorMaster(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<any>>(`/supervisors/${id}`);
  },

  // -------------------------------------------------------------------------
  // Key Screens: 4. Project Duration
  // -------------------------------------------------------------------------
  async getProjectDurations(): Promise<ProjectDuration[]> {
    const res = await apiClient.get<ApiResponse<ProjectDuration[]>>('/project-durations');
    return res.data.data;
  },

  async createProjectDuration(data: {
    projectName: string;
    siteName: string;
    fromDate: string;
    toDate: string;
  }): Promise<ProjectDuration> {
    const res = await apiClient.post<ApiResponse<ProjectDuration>>('/project-durations', data);
    return res.data.data;
  },

  async deleteProjectDuration(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<any>>(`/project-durations/${id}`);
  },

  // -------------------------------------------------------------------------
  // Key Screens: 5. Inventory Master
  // -------------------------------------------------------------------------
  async getInventoryMaster(): Promise<InventoryMasterItem[]> {
    const res = await apiClient.get<ApiResponse<InventoryMasterItem[]>>('/inventory-master');
    return res.data.data;
  },

  async createInventoryMaster(data: {
    category: string;
    material: string;
    measurement: string;
    materialType?: 'Prime' | 'Other';
    natureOfWork?: string[];
    initialStock?: number;
    minStock?: number;
    site?: string;
  }): Promise<InventoryMasterItem> {
    const res = await apiClient.post<ApiResponse<InventoryMasterItem>>('/inventory-master', data);
    return res.data.data;
  },

  async updateInventoryMaster(id: string, data: Partial<InventoryMasterItem>): Promise<InventoryMasterItem> {
    const res = await apiClient.put<ApiResponse<InventoryMasterItem>>(`/inventory-master/${id}`, data);
    return res.data.data;
  },

  async deleteInventoryMaster(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<any>>(`/inventory-master/${id}`);
  },

  // -------------------------------------------------------------------------
  // Key Screens: 6. Inward Material Entry
  // -------------------------------------------------------------------------
  async getMaterialInward(site?: string): Promise<InwardMaterialEntry[]> {
    const params = site && site !== 'All Sites' ? { site } : {};
    const res = await apiClient.get<ApiResponse<InwardMaterialEntry[]>>('/material-inward', { params });
    return res.data.data;
  },

  async createMaterialInward(data: {
    date: string;
    site?: string;
    project?: string;
    category: string;
    material: string;
    quantity: number;
    measurement: string;
    totalValue?: number;
  }): Promise<InwardMaterialEntry> {
    const res = await apiClient.post<ApiResponse<InwardMaterialEntry>>('/material-inward', data);
    return res.data.data;
  },

  // -------------------------------------------------------------------------
  // Key Screens: 7. Outward Material Entry
  // -------------------------------------------------------------------------
  async getMaterialOutward(site?: string): Promise<OutwardMaterialEntry[]> {
    const params = site && site !== 'All Sites' ? { site } : {};
    const res = await apiClient.get<ApiResponse<OutwardMaterialEntry[]>>('/material-outward', { params });
    return res.data.data;
  },

  async createMaterialOutward(data: {
    date: string;
    project: string;
    site: string;
    material?: string;
    natureOfWork: string;
    quantity: number;
    measurement: string;
  }): Promise<OutwardMaterialEntry> {
    const res = await apiClient.post<ApiResponse<OutwardMaterialEntry>>('/material-outward', data);
    return res.data.data;
  },

  // -------------------------------------------------------------------------
  // Key Screens: 8. Labour Entry
  // -------------------------------------------------------------------------
  async getLabourEntries(): Promise<LabourEntry[]> {
    const res = await apiClient.get<ApiResponse<LabourEntry[]>>('/labour-entries');
    return res.data.data;
  },

  async createLabourEntry(data: {
    date: string;
    project: string;
    site: string;
    natureOfWork: string;
    type: 'Count (Labour)' | 'Other';
    workerCount: number;
  }): Promise<LabourEntry> {
    const res = await apiClient.post<ApiResponse<LabourEntry>>('/labour-entries', data);
    return res.data.data;
  },

  async deleteLabourEntry(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<any>>(`/labour-entries/${id}`);
  },
};
