import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  Site,
  InventoryItem,
  MaterialRequest,
  Delivery,
  SitePhoto,
  LowStockAlertItem,
  ActivityItem,
  InwardMaterialEntry,
  OutwardMaterialEntry,
  LabourEntry,
  ProjectMaster,
  InventoryMasterItem,
} from '@project/shared';
import { constructionService } from '../services/construction.service';
import { useAuth } from '../hooks/useAuth';

export type UserRoleMode = 'admin' | 'supervisor';

interface DashboardContextType {
  roleMode: UserRoleMode;
  setRoleMode: (mode: UserRoleMode) => void;
  isSupervisor: boolean;
  selectedSite: string;
  setSelectedSite: (site: string) => void;
  sitesList: string[];
  myAssignedSites: Site[];
  sites: Site[];
  inventory: InventoryItem[];
  materialRequests: MaterialRequest[];
  deliveries: Delivery[];
  photos: SitePhoto[];
  lowStockAlerts: LowStockAlertItem[];
  activities: ActivityItem[];
  inwardEntries: InwardMaterialEntry[];
  outwardEntries: OutwardMaterialEntry[];
  labourEntries: LabourEntry[];
  projectsMaster: ProjectMaster[];
  inventoryMaster: InventoryMasterItem[];
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
    urgency?: string;
    purpose?: string;
    notes?: string;
    requiredDate?: string;
  }) => Promise<void>;
  approveRequest: (id: string) => Promise<void>;
  sendMaterialsToSupervisor: (
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
  ) => Promise<void>;
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
  updateSite: (id: string, site: Partial<Site>) => Promise<void>;
  deleteSite: (id: string) => Promise<void>;
  deleteDelivery: (id: string) => Promise<void>;
  addInventoryItem: (item: Partial<InventoryItem>) => Promise<void>;
  updateInventoryItem: (id: string, item: Partial<InventoryItem>) => Promise<void>;
  deleteInventoryItem: (id: string) => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
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

  const isSupervisor = roleMode === 'supervisor' || user?.role === 'supervisor';

  const [selectedSite, setSelectedSite] = useState<string>(() => (isSupervisor ? '' : 'All Sites'));
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  // Data collections (Loaded from MongoDB via API)
  const [sites, setSites] = useState<Site[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [materialRequests, setMaterialRequests] = useState<MaterialRequest[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [photos, setPhotos] = useState<SitePhoto[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<LowStockAlertItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [inwardEntries, setInwardEntries] = useState<InwardMaterialEntry[]>([]);
  const [outwardEntries, setOutwardEntries] = useState<OutwardMaterialEntry[]>([]);
  const [labourEntries, setLabourEntries] = useState<LabourEntry[]>([]);
  const [projectsMaster, setProjectsMaster] = useState<ProjectMaster[]>([]);
  const [inventoryMaster, setInventoryMaster] = useState<InventoryMasterItem[]>([]);

  // Compute supervisor's assigned sites (explicit linkage, no false cross-sharing)
  const myAssignedSites = sites.filter((s) => {
    if (s.supervisorId && user?.id && String(s.supervisorId) === String(user.id)) return true;
    if (s.supervisorEmail && user?.email && s.supervisorEmail.trim().toLowerCase() === user.email.trim().toLowerCase()) return true;
    if (s.supervisor && user?.name && s.supervisor.trim().toLowerCase() === user.name.trim().toLowerCase()) return true;
    return false;
  });

  // Compute site names list scoped to role
  const sitesList = isSupervisor
    ? myAssignedSites.map((s) => s.name)
    : ['All Sites', ...sites.map((s) => s.name)];

  // Synchronize active selected site for supervisor so it never bleeds into other sites
  useEffect(() => {
    if (isSupervisor) {
      if (myAssignedSites.length > 0) {
        if (!selectedSite || !myAssignedSites.some((s) => s.name === selectedSite)) {
          setSelectedSite(myAssignedSites[0].name);
        }
      } else {
        setSelectedSite('');
      }
    }
  }, [isSupervisor, sites, user]);

  // Fetch all active data from backend API in parallel without old deprecated blocking calls
  const refreshData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const [
        sitesRes,
        invRes,
        lowStockRes,
        inwardRes,
        outwardRes,
        labourRes,
        projectsRes,
        masterRes,
        actRes,
      ] = await Promise.allSettled([
        constructionService.getSites(),
        constructionService.getInventory(selectedSite),
        constructionService.getLowStock(selectedSite),
        constructionService.getMaterialInward(selectedSite),
        constructionService.getMaterialOutward(selectedSite),
        constructionService.getLabourEntries(),
        constructionService.getProjectsMaster(),
        constructionService.getInventoryMaster(),
        constructionService.getActivities(selectedSite),
      ]);

      if (sitesRes.status === 'fulfilled' && Array.isArray(sitesRes.value)) {
        setSites(sitesRes.value);
      }
      if (invRes.status === 'fulfilled' && Array.isArray(invRes.value)) {
        setInventory(invRes.value);
      }
      if (lowStockRes.status === 'fulfilled' && Array.isArray(lowStockRes.value)) {
        setLowStockAlerts(lowStockRes.value);
      }
      if (inwardRes.status === 'fulfilled' && Array.isArray(inwardRes.value)) {
        setInwardEntries(inwardRes.value);
      }
      if (outwardRes.status === 'fulfilled' && Array.isArray(outwardRes.value)) {
        setOutwardEntries(outwardRes.value);
      }
      if (labourRes.status === 'fulfilled' && Array.isArray(labourRes.value)) {
        setLabourEntries(labourRes.value);
      }
      if (projectsRes.status === 'fulfilled' && Array.isArray(projectsRes.value)) {
        setProjectsMaster(projectsRes.value);
      }
      if (masterRes.status === 'fulfilled' && Array.isArray(masterRes.value)) {
        setInventoryMaster(masterRes.value);
      }
      if (actRes.status === 'fulfilled' && Array.isArray(actRes.value)) {
        setActivities(actRes.value);
      }
    } catch (err) {
      console.warn('Dashboard data refresh error:', err);
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
    urgency?: string;
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
        urgency: data.urgency || 'Normal',
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

  const sendMaterialsToSupervisor = async (
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
  ) => {
    try {
      await constructionService.sendMaterialsToSupervisor(id, data);
      await refreshData();
    } catch {
      setMaterialRequests((prev) =>
        prev.map((r) =>
          r.id === id || r.requestId === id
            ? {
                ...r,
                status: 'Approved',
                dispatchedQty: data?.quantity || r.quantity,
                dispatchedOn: 'Today',
                dispatchedBy: 'Admin User',
                dispatchNotes: data?.notes,
              }
            : r
        )
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

  const updateSite = async (id: string, siteData: Partial<Site>) => {
    try {
      await constructionService.updateSite(id, siteData);
      await refreshData();
    } catch (err) {
      console.error('Failed to update site:', err);
      throw err;
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

  const addInventoryItem = async (item: Partial<InventoryItem>) => {
    try {
      await constructionService.createInventoryItem(item);
      await refreshData();
    } catch {
      const newItem: InventoryItem = {
        id: `inv-${Date.now()}`,
        name: item.name || 'New Material',
        category: (item.category as any) || 'Others',
        unit: item.unit || 'units',
        totalStock: item.totalStock || 0,
        minStock: item.minStock || 10,
        status: (item.totalStock || 0) <= (item.minStock || 10) ? 'Low' : 'Good',
        site: item.site || selectedSite || 'All Sites',
      };
      setInventory((prev) => [newItem, ...prev]);
    }
  };

  const updateInventoryItem = async (id: string, item: Partial<InventoryItem>) => {
    try {
      await constructionService.updateInventoryItem(id, item);
      await refreshData();
    } catch {
      setInventory((prev) =>
        prev.map((i) => (i.id === id ? { ...i, ...item } : i))
      );
    }
  };

  const deleteInventoryItem = async (id: string) => {
    try {
      await constructionService.deleteInventoryItem(id);
      await refreshData();
    } catch {
      setInventory((prev) => prev.filter((i) => i.id !== id));
    }
  };

  return (
    <DashboardContext.Provider
      value={{
        roleMode,
        setRoleMode,
        isSupervisor,
        selectedSite,
        setSelectedSite,
        sitesList,
        myAssignedSites,
        sites,
        inventory,
        materialRequests,
        deliveries,
        photos,
        lowStockAlerts,
        activities,
        inwardEntries,
        outwardEntries,
        labourEntries,
        projectsMaster,
        inventoryMaster,
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
        sendMaterialsToSupervisor,
        rejectRequest,
        cancelRequest,
        recordDelivery,
        uploadPhoto,
        addSite,
        updateSite,
        deleteSite,
        deleteDelivery,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
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
