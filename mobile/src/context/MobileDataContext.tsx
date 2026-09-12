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
import { useAuth } from '../hooks/useAuth';

export type MobileRoleMode = 'admin' | 'supervisor';

interface MobileDataContextType {
  roleMode: MobileRoleMode;
  setRoleMode: (mode: MobileRoleMode) => void;
  toggleRole: () => void;
  selectedSite: string;
  setSelectedSite: (site: string) => void;
  sites: Site[];
  myAssignedSites: Site[];
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
  updateSite: (id: string, site: Partial<Site>) => Promise<void>;
  addSite: (site: Partial<Site>) => Promise<void>;
  deleteSite: (id: string) => Promise<void>;
  uploadPhoto: (data: {
    title: string;
    site: string;
    type: 'Stock In' | 'Stock Out' | 'Site Progress';
    imageUrl: string;
    uploader?: string;
  }) => Promise<void>;
  updateDeliveryStatus: (id: string, status: Delivery['status']) => Promise<void>;
}

const MobileDataContext = createContext<MobileDataContextType | undefined>(undefined);

export const MobileDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [roleMode, setRoleMode] = useState<MobileRoleMode>(
    user?.role === 'supervisor' ? 'supervisor' : 'admin'
  );
  const [selectedSite, setSelectedSite] = useState<string>('All Sites');
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  // Sync roleMode whenever authenticated user profile changes
  useEffect(() => {
    if (user?.role === 'supervisor') {
      setRoleMode('supervisor');
    } else if (user?.role === 'admin') {
      setRoleMode('admin');
    }
  }, [user]);

  // Clean data collections (Loaded from MongoDB via API)
  const [sites, setSites] = useState<Site[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [materialRequests, setMaterialRequests] = useState<MaterialRequest[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [photos, setPhotos] = useState<SitePhoto[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<LowStockAlertItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  // Strict supervisor assigned sites calculation (Zero cross-sharing)
  const myAssignedSites = sites.filter((s) => {
    if (s.supervisorId && user?.id && String(s.supervisorId) === String(user.id)) return true;
    if (s.supervisorEmail && user?.email && s.supervisorEmail.trim().toLowerCase() === user.email.trim().toLowerCase()) return true;
    if (s.supervisor && user?.name && s.supervisor.trim().toLowerCase() === user.name.trim().toLowerCase()) return true;
    return false;
  });

  const isSupervisor = roleMode === 'supervisor' || user?.role === 'supervisor';

  // Synchronize active selected site for supervisor so it never defaults to 'All Sites' or leaks data
  useEffect(() => {
    if (isSupervisor) {
      if (myAssignedSites.length > 0) {
        if (!selectedSite || selectedSite === 'All Sites' || !myAssignedSites.some((s) => s.name === selectedSite)) {
          setSelectedSite(myAssignedSites[0].name);
        }
      } else {
        setSelectedSite('');
      }
    } else {
      if (!selectedSite) {
        setSelectedSite('All Sites');
      }
    }
  }, [isSupervisor, myAssignedSites, selectedSite]);

  const toggleRole = () => {
    setRoleMode((prev) => (prev === 'admin' ? 'supervisor' : 'admin'));
  };

  const refreshData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const backendSites = await constructionService.getSites();
      if (Array.isArray(backendSites)) setSites(backendSites);

      const targetSiteQuery = isSupervisor ? selectedSite : selectedSite;
      const backendInv = await constructionService.getInventory(targetSiteQuery);
      if (backendInv) setInventory(backendInv);

      const backendAlerts = await constructionService.getLowStock(targetSiteQuery);
      if (backendAlerts) setLowStockAlerts(backendAlerts);

      const backendReqs = await constructionService.getRequests(targetSiteQuery);
      if (backendReqs) setMaterialRequests(backendReqs);

      const backendDelivs = await constructionService.getDeliveries(targetSiteQuery);
      if (backendDelivs) setDeliveries(backendDelivs);

      const backendPhotos = await constructionService.getPhotos(targetSiteQuery);
      if (backendPhotos) setPhotos(backendPhotos);

      const backendActs = await constructionService.getActivities(targetSiteQuery);
      if (Array.isArray(backendActs)) setActivities(backendActs);
    } catch (err) {
      console.warn('Mobile: Backend query update failed, using cached state:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, [selectedSite, isSupervisor]);

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
        requestedBy: user?.name || (roleMode === 'admin' ? 'Admin User' : 'Site Supervisor'),
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
        requestedBy: user?.name || (roleMode === 'admin' ? 'Admin User' : 'Site Supervisor'),
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

  const updateSite = async (id: string, siteData: Partial<Site>) => {
    try {
      const updated = await constructionService.updateSite(id, siteData);
      setSites((prev) => prev.map((s) => (s.id === id ? updated : s)));
      await refreshData();
    } catch (e) {
      console.warn('Mobile updateSite error:', e);
      setSites((prev) => prev.map((s) => (s.id === id ? { ...s, ...siteData } : s)));
    }
  };

  const addSite = async (siteData: Partial<Site>) => {
    try {
      await constructionService.createSite(siteData);
      await refreshData();
    } catch (e) {
      console.warn('Mobile addSite fallback:', e);
      const newSite: Site = {
        id: `s-${Date.now()}`,
        code: siteData.code || `RBL-S-00${sites.length + 1}`,
        name: siteData.name || 'New Site',
        location: siteData.location || 'Tamil Nadu',
        supervisor: siteData.supervisor || 'Unassigned',
        supervisorId: siteData.supervisorId,
        supervisorEmail: siteData.supervisorEmail,
        status: siteData.status || 'Active',
        totalMaterials: siteData.totalMaterials || 0,
        stockValue: siteData.stockValue || 0,
        stockValueFormatted: siteData.stockValueFormatted || '₹0',
        imageUrl: siteData.imageUrl,
        startDate: siteData.startDate || 'Just now',
        contact: siteData.contact,
        projectType: siteData.projectType || 'Residential Construction',
      };
      setSites((prev) => [...prev, newSite]);
    }
  };

  const deleteSite = async (id: string) => {
    try {
      await constructionService.deleteSite(id);
      setSites((prev) => prev.filter((s) => s.id !== id));
      await refreshData();
    } catch (e) {
      console.warn('Mobile deleteSite fallback:', e);
      setSites((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const uploadPhoto = async (data: {
    title: string;
    site: string;
    type: 'Stock In' | 'Stock Out' | 'Site Progress';
    imageUrl: string;
    uploader?: string;
  }) => {
    const uploaderName = data.uploader || user?.name || (roleMode === 'admin' ? 'Admin User' : 'Site Supervisor');
    try {
      await constructionService.uploadPhoto({
        ...data,
        uploader: uploaderName,
      });
      await refreshData();
    } catch (e) {
      console.warn('Mobile uploadPhoto fallback:', e);
      const newPhoto: SitePhoto = {
        id: `p-${Date.now()}`,
        title: data.title,
        site: data.site,
        type: data.type,
        timestamp: 'Just now',
        imageUrl: data.imageUrl,
        uploader: uploaderName,
      };
      setPhotos((prev) => [newPhoto, ...prev]);
    }
  };

  const updateDeliveryStatus = async (id: string, status: Delivery['status']) => {
    try {
      await constructionService.updateDelivery(id, { status });
      await refreshData();
    } catch (e) {
      console.warn('Mobile updateDelivery fallback:', e);
      setDeliveries((prev) =>
        prev.map((d) => (d.id === id || d.deliveryId === id ? { ...d, status } : d))
      );
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
        myAssignedSites,
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
        updateSite,
        addSite,
        deleteSite,
        uploadPhoto,
        updateDeliveryStatus,
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
