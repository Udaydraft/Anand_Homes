import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  Site,
  InventoryItem,
  MaterialRequest,
  Delivery,
  SitePhoto,
  LowStockAlertItem,
  ActivityItem,
} from '@project/shared';
import { constructionService } from '../services/construction.service';

export type UserRoleMode = 'admin' | 'supervisor';

interface DashboardContextType {
  roleMode: UserRoleMode;
  setRoleMode: (mode: UserRoleMode) => void;
  selectedSite: string;
  setSelectedSite: (site: string) => void;
  sitesList: string[];
  sites: Site[];
  inventory: InventoryItem[];
  materialRequests: MaterialRequest[];
  deliveries: Delivery[];
  photos: SitePhoto[];
  lowStockAlerts: LowStockAlertItem[];
  activities: ActivityItem[];
  globalSearch: string;
  setGlobalSearch: (s: string) => void;
  selectedDate: string;
  setSelectedDate: (d: string) => void;
  isLoadingData: boolean;
  refreshData: () => Promise<void>;
  // Actions
  addStockIn: (data: {
    site: string;
    material: string;
    quantity: number;
    unit: string;
    supplier: string;
    invoiceNo: string;
    deliveryDate: string;
    notes?: string;
  }) => Promise<void>;
  addStockOut: (data: {
    site: string;
    material: string;
    quantity: number;
    unit: string;
    usedFor: string;
    requestedBy: string;
    notes?: string;
  }) => Promise<void>;
  createMaterialRequest: (data: {
    site: string;
    material: string;
    quantity: number;
    unit: string;
    purpose?: string;
    notes?: string;
    requiredDate?: string;
  }) => Promise<void>;
  approveRequest: (id: string) => Promise<void>;
  rejectRequest: (id: string) => Promise<void>;
  cancelRequest: (id: string) => Promise<void>;
  recordDelivery: (data: {
    deliveryId?: string;
    supplier: string;
    site: string;
    material: string;
    expectedQty: number;
    receivedQty: number;
    unit: string;
    status: 'Expected' | 'In Transit' | 'Received' | 'Cancelled';
  }) => Promise<void>;
  uploadPhoto: (data: {
    title: string;
    site: string;
    type: 'Stock In' | 'Stock Out' | 'Site Progress';
    imageUrl: string;
  }) => Promise<void>;
  addSite: (site: Partial<Site>) => Promise<void>;
  deleteSite: (id: string) => Promise<void>;
  deleteDelivery: (id: string) => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [roleMode, setRoleModeState] = useState<UserRoleMode>(() => {
    const saved = localStorage.getItem('ah_user_role');
    if (saved === 'supervisor' || saved === 'admin') return saved;
    const userJson = localStorage.getItem('user_info');
    if (userJson) {
      try {
        const u = JSON.parse(userJson);
        if (u.role === 'supervisor') return 'supervisor';
        if (u.role === 'admin') return 'admin';
      } catch {}
    }
    return 'admin';
  });

  const setRoleMode = (mode: UserRoleMode) => {
    localStorage.setItem('ah_user_role', mode);
    setRoleModeState(mode);
  };

  const [selectedSite, setSelectedSite] = useState<string>('All Sites');
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  // Data collections (Empty - loaded from MongoDB via API)
  const [sites, setSites] = useState<Site[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [materialRequests, setMaterialRequests] = useState<MaterialRequest[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [photos, setPhotos] = useState<SitePhoto[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<LowStockAlertItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  // Compute site names list
  const sitesList = ['All Sites', ...sites.map((s) => s.name)];

  // Fetch all data from backend API
  const refreshData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      // 1. Sites
      const backendSites = await constructionService.getSites();
      if (Array.isArray(backendSites)) {
        setSites(backendSites);
      }

      // 2. Inventory
      const backendInv = await constructionService.getInventory(selectedSite);
      if (Array.isArray(backendInv)) {
        setInventory(backendInv);
      }

      // 3. Low stock alerts
      const backendAlerts = await constructionService.getLowStock(selectedSite);
      if (Array.isArray(backendAlerts)) {
        setLowStockAlerts(backendAlerts);
      }

      // 4. Requests
      const backendReqs = await constructionService.getRequests(selectedSite);
      if (Array.isArray(backendReqs)) {
        setMaterialRequests(backendReqs);
      }

      // 5. Deliveries
      const backendDelivs = await constructionService.getDeliveries(selectedSite);
      if (Array.isArray(backendDelivs)) {
        setDeliveries(backendDelivs);
      }

      // 6. Photos
      const backendPhotos = await constructionService.getPhotos(selectedSite);
      if (Array.isArray(backendPhotos)) {
        setPhotos(backendPhotos);
      }

      // 7. Activities
      const backendActs = await constructionService.getActivities(selectedSite);
      if (Array.isArray(backendActs)) {
        setActivities(backendActs);
      }
    } catch (err) {
      console.warn('Backend API currently unreachable, using local state:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, [selectedSite]);

  // Initial load and on site change
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Actions
  const addStockIn = async (data: {
    site: string;
    material: string;
    quantity: number;
    unit: string;
    supplier: string;
    invoiceNo: string;
    deliveryDate: string;
    notes?: string;
  }) => {
    try {
      await constructionService.stockIn(data);
      await refreshData();
    } catch {
      // Optimistic update if backend offline
      setInventory((prev) => {
        const exists = prev.some(
          (i) => i.name.toLowerCase() === data.material.toLowerCase() && i.site === data.site
        );
        if (exists) {
          return prev.map((item) =>
            item.name.toLowerCase() === data.material.toLowerCase() && item.site === data.site
              ? { ...item, totalStock: item.totalStock + data.quantity, status: 'Good' }
              : item
          );
        }
        return [
          ...prev,
          {
            id: `inv-${Date.now()}`,
            name: data.material,
            category: 'Others',
            unit: data.unit,
            totalStock: data.quantity,
            minStock: 50,
            status: 'Good',
            site: data.site,
          },
        ];
      });
      setDeliveries((prev) => [
        {
          id: `dlv-${Date.now()}`,
          deliveryId: `DEL-${Date.now().toString().slice(-4)}`,
          supplier: data.supplier,
          site: data.site,
          material: data.material,
          expectedQty: data.quantity,
          receivedQty: data.quantity,
          unit: data.unit,
          status: 'Received',
          receivedOn: data.deliveryDate,
          invoiceNo: data.invoiceNo,
        },
        ...prev,
      ]);
    }
  };

  const addStockOut = async (data: {
    site: string;
    material: string;
    quantity: number;
    unit: string;
    usedFor: string;
    requestedBy: string;
    notes?: string;
  }) => {
    try {
      await constructionService.stockOut(data);
      await refreshData();
    } catch {
      setInventory((prev) =>
        prev.map((item) =>
          item.name.toLowerCase() === data.material.toLowerCase() && item.site === data.site
            ? {
                ...item,
                totalStock: Math.max(0, item.totalStock - data.quantity),
                status: item.totalStock - data.quantity <= item.minStock ? 'Low' : 'Good',
              }
            : item
        )
      );
    }
  };

  const createMaterialRequest = async (data: {
    site: string;
    material: string;
    quantity: number;
    unit: string;
    purpose?: string;
    notes?: string;
    requiredDate?: string;
  }) => {
    try {
      await constructionService.createRequest({
        ...data,
        requestedBy: roleMode === 'admin' ? 'Admin User' : 'Site Supervisor',
      });
      await refreshData();
    } catch {
      const newReq: MaterialRequest = {
        id: `req-${Date.now()}`,
        requestId: `REQ-${Math.floor(1025 + Math.random() * 50)}`,
        site: data.site,
        material: data.material,
        quantity: data.quantity,
        unit: data.unit,
        requestedBy: roleMode === 'admin' ? 'Admin User' : 'Site Supervisor',
        requestedOn: 'Today',
        requiredDate: data.requiredDate || 'Next week',
        purpose: data.purpose || 'Construction General',
        status: 'Pending',
        notes: data.notes || '',
      };
      setMaterialRequests((prev) => [newReq, ...prev]);
    }
  };

  const approveRequest = async (id: string) => {
    try {
      await constructionService.updateRequestStatus(id, 'Approved');
      await refreshData();
    } catch {
      setMaterialRequests((prev) =>
        prev.map((r) => (r.id === id || r.requestId === id ? { ...r, status: 'Approved' } : r))
      );
    }
  };

  const rejectRequest = async (id: string) => {
    try {
      await constructionService.updateRequestStatus(id, 'Rejected');
      await refreshData();
    } catch {
      setMaterialRequests((prev) =>
        prev.map((r) => (r.id === id || r.requestId === id ? { ...r, status: 'Rejected' } : r))
      );
    }
  };

  const cancelRequest = async (id: string) => {
    try {
      await constructionService.deleteRequest(id);
      await refreshData();
    } catch {
      setMaterialRequests((prev) => prev.filter((r) => r.id !== id && r.requestId !== id));
    }
  };

  const recordDelivery = async (data: {
    deliveryId?: string;
    supplier: string;
    site: string;
    material: string;
    expectedQty: number;
    receivedQty: number;
    unit: string;
    status: 'Expected' | 'In Transit' | 'Received' | 'Cancelled';
  }) => {
    try {
      await constructionService.recordDelivery(data);
      await refreshData();
    } catch {
      setDeliveries((prev) => [
        {
          id: `dlv-${Date.now()}`,
          deliveryId: data.deliveryId || `DEL-${Date.now().toString().slice(-4)}`,
          ...data,
        },
        ...prev,
      ]);
    }
  };

  const uploadPhoto = async (data: {
    title: string;
    site: string;
    type: 'Stock In' | 'Stock Out' | 'Site Progress';
    imageUrl: string;
  }) => {
    try {
      await constructionService.uploadPhoto({
        ...data,
        uploader: roleMode === 'admin' ? 'Admin User' : 'Site Supervisor',
      });
      await refreshData();
    } catch {
      const newPhoto: SitePhoto = {
        id: `p-${Date.now()}`,
        title: data.title,
        site: data.site,
        type: data.type,
        timestamp: 'Just now',
        imageUrl: data.imageUrl,
        uploader: roleMode === 'admin' ? 'Admin User' : 'Site Supervisor',
      };
      setPhotos((prev) => [newPhoto, ...prev]);
    }
  };

  const addSite = async (site: Partial<Site>) => {
    try {
      await constructionService.createSite(site);
      await refreshData();
    } catch {
      const newSite: Site = {
        id: `s-${Date.now()}`,
        code: site.code || `RBL-S-00${sites.length + 1}`,
        name: site.name || 'New Site',
        location: site.location || 'Tamil Nadu',
        supervisor: site.supervisor || 'Unassigned',
        status: site.status || 'Active',
        totalMaterials: site.totalMaterials || 0,
        stockValue: site.stockValue || 0,
        stockValueFormatted: site.stockValueFormatted || '₹0',
        imageUrl: site.imageUrl,
        startDate: site.startDate || 'Just now',
        contact: site.contact,
        projectType: site.projectType || 'Residential Project',
      };
      setSites((prev) => [...prev, newSite]);
    }
  };

  const deleteSite = async (id: string) => {
    try {
      await constructionService.deleteSite(id);
      await refreshData();
    } catch {
      setSites((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const deleteDelivery = async (id: string) => {
    try {
      await constructionService.deleteDelivery(id);
      await refreshData();
    } catch {
      setDeliveries((prev) => prev.filter((d) => d.id !== id));
    }
  };

  return (
    <DashboardContext.Provider
      value={{
        roleMode,
        setRoleMode,
        selectedSite,
        setSelectedSite,
        sitesList,
        sites,
        inventory,
        materialRequests,
        deliveries,
        photos,
        lowStockAlerts,
        activities,
        globalSearch,
        setGlobalSearch,
        selectedDate,
        setSelectedDate,
        isLoadingData,
        refreshData,
        addStockIn,
        addStockOut,
        createMaterialRequest,
        approveRequest,
        rejectRequest,
        cancelRequest,
        recordDelivery,
        uploadPhoto,
        addSite,
        deleteSite,
        deleteDelivery,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

export const useDashboardContext = useDashboard;
