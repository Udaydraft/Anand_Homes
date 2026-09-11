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

export type MobileRoleMode = 'admin' | 'supervisor';

interface MobileDataContextType {
  roleMode: MobileRoleMode;
  setRoleMode: (mode: MobileRoleMode) => void;
  toggleRole: () => void;
  selectedSite: string;
  setSelectedSite: (site: string) => void;
  sites: Site[];
  inventory: InventoryItem[];
  materialRequests: MaterialRequest[];
  deliveries: Delivery[];
  photos: SitePhoto[];
  lowStockAlerts: LowStockAlertItem[];
  activities: ActivityItem[];
  isLoadingData: boolean;
  refreshData: () => Promise<void>;
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
  createRequest: (data: {
    site: string;
    material: string;
    quantity: number;
    unit: string;
    purpose?: string;
    requiredDate?: string;
    notes?: string;
  }) => Promise<void>;
  approveRequest: (id: string) => Promise<void>;
  rejectRequest: (id: string) => Promise<void>;
  cancelRequest: (id: string) => Promise<void>;
}

const MobileDataContext = createContext<MobileDataContextType | undefined>(undefined);

export const MobileDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [roleMode, setRoleMode] = useState<MobileRoleMode>('admin');
  const [selectedSite, setSelectedSite] = useState<string>('All Sites');
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  // Clean data collections (Loaded from MongoDB via API)
  const [sites, setSites] = useState<Site[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [materialRequests, setMaterialRequests] = useState<MaterialRequest[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [photos, setPhotos] = useState<SitePhoto[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<LowStockAlertItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  const toggleRole = () => {
    setRoleMode((prev) => (prev === 'admin' ? 'supervisor' : 'admin'));
  };

  const refreshData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const backendSites = await constructionService.getSites();
      if (backendSites && backendSites.length > 0) setSites(backendSites);

      const backendInv = await constructionService.getInventory(selectedSite);
      if (backendInv) setInventory(backendInv);

      const backendAlerts = await constructionService.getLowStock(selectedSite);
      if (backendAlerts) setLowStockAlerts(backendAlerts);

      const backendReqs = await constructionService.getRequests(selectedSite);
      if (backendReqs) setMaterialRequests(backendReqs);

      const backendDelivs = await constructionService.getDeliveries(selectedSite);
      if (backendDelivs) setDeliveries(backendDelivs);

      const backendPhotos = await constructionService.getPhotos(selectedSite);
      if (backendPhotos) setPhotos(backendPhotos);

      const backendActs = await constructionService.getActivities(selectedSite);
      if (backendActs && backendActs.length > 0) setActivities(backendActs);
    } catch (err) {
      console.warn('Mobile: Backend currently unreachable, using local state:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, [selectedSite]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

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
      setInventory((prev) =>
        prev.map((i) =>
          i.name.toLowerCase() === data.material.toLowerCase()
            ? { ...i, totalStock: i.totalStock + data.quantity }
            : i
        )
      );
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
        prev.map((i) =>
          i.name.toLowerCase() === data.material.toLowerCase()
            ? { ...i, totalStock: Math.max(0, i.totalStock - data.quantity) }
            : i
        )
      );
    }
  };

  const createRequest = async (data: {
    site: string;
    material: string;
    quantity: number;
    unit: string;
    purpose?: string;
    requiredDate?: string;
    notes?: string;
  }) => {
    try {
      await constructionService.createRequest({
        ...data,
        requestedBy: roleMode === 'admin' ? 'Admin User' : 'Rajesh Kumar',
      });
      await refreshData();
    } catch {
      const newR: MaterialRequest = {
        id: `req-${Date.now()}`,
        requestId: `REQ-${Math.floor(1025 + Math.random() * 50)}`,
        site: data.site,
        material: data.material,
        quantity: data.quantity,
        unit: data.unit,
        requestedBy: roleMode === 'admin' ? 'Admin User' : 'Rajesh Kumar',
        requestedOn: 'Today',
        requiredDate: data.requiredDate || 'Next week',
        purpose: data.purpose || 'Foundation Work',
        status: 'Pending',
        notes: data.notes || '',
      };
      setMaterialRequests((prev) => [newR, ...prev]);
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

  return (
    <MobileDataContext.Provider
      value={{
        roleMode,
        setRoleMode,
        toggleRole,
        selectedSite,
        setSelectedSite,
        sites,
        inventory,
        materialRequests,
        deliveries,
        photos,
        lowStockAlerts,
        activities,
        isLoadingData,
        refreshData,
        addStockIn,
        addStockOut,
        createRequest,
        approveRequest,
        rejectRequest,
        cancelRequest,
      }}
    >
      {children}
    </MobileDataContext.Provider>
  );
};

export const useMobileData = (): MobileDataContextType => {
  const context = useContext(MobileDataContext);
  if (!context) {
    throw new Error('useMobileData must be used within MobileDataProvider');
  }
  return context;
};
