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

const initialSites: Site[] = [
  {
    id: 's-1',
    code: 'RBL-S-001',
    name: 'Site Alpha',
    location: 'Chennai, TN',
    supervisor: 'Rajesh Kumar',
    status: 'Active',
    totalMaterials: 32,
    stockValue: 824500,
    stockValueFormatted: '₹8.4 L',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=300&auto=format&fit=crop&q=80',
    startDate: '12 Jan 2025',
    contact: '98765 43210',
    projectType: 'Anna Nagar Residential',
  },
  {
    id: 's-2',
    code: 'RBL-S-002',
    name: 'Site Beta',
    location: 'Coimbatore, TN',
    supervisor: 'Siva Kumar',
    status: 'Active',
    totalMaterials: 26,
    stockValue: 661200,
    stockValueFormatted: '₹6.6 L',
    imageUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=300&auto=format&fit=crop&q=80',
    startDate: '20 Feb 2025',
    contact: '98765 43211',
    projectType: 'Commercial Building',
  },
  {
    id: 's-3',
    code: 'RBL-S-003',
    name: 'Site Gamma',
    location: 'Madurai, TN',
    supervisor: 'Mani',
    status: 'Active',
    totalMaterials: 28,
    stockValue: 645000,
    stockValueFormatted: '₹6.5 L',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=300&auto=format&fit=crop&q=80',
    startDate: '05 Mar 2025',
    contact: '98765 43212',
    projectType: 'Villa Construction Project',
  },
];

const initialInventory: InventoryItem[] = [
  { id: 'inv-1', name: 'UltraTech PPC Cement', category: 'Cement', unit: 'Bags', totalStock: 420, minStock: 100, status: 'Good', site: 'Site Alpha' },
  { id: 'inv-2', name: 'TMT Steel Bars 12mm', category: 'Steel', unit: 'Tons', totalStock: 8.5, minStock: 15, status: 'Low', site: 'Site Alpha' },
  { id: 'inv-3', name: 'River Sand (Coarse)', category: 'Aggregate', unit: 'Cu.ft', totalStock: 1200, minStock: 400, status: 'Good', site: 'Site Alpha' },
  { id: 'inv-4', name: 'Red Clay Bricks', category: 'Masonry', unit: 'Pieces', totalStock: 4500, minStock: 1000, status: 'Good', site: 'Site Alpha' },
  { id: 'inv-5', name: 'Berger Weathercoat Paint', category: 'Finishing', unit: 'Litres', totalStock: 0, minStock: 50, status: 'Out of Stock', site: 'Site Alpha' },
];

const initialRequests: MaterialRequest[] = [
  {
    id: 'req-1',
    requestId: 'REQ-2025-001',
    site: 'Site Alpha',
    material: 'TMT Steel Bars 12mm',
    quantity: 10,
    unit: 'Tons',
    requestedBy: 'Rajesh Kumar (Supervisor)',
    requestedOn: '09 Mar 2025, 10:30 AM',
    requiredDate: '14 Mar 2025',
    purpose: 'Column reinforcement for 2nd floor slab',
    status: 'Pending',
    notes: 'Urgent - current stock is critical',
  },
];

const initialDeliveries: Delivery[] = [
  {
    id: 'del-1',
    deliveryId: 'DEL-2025-089',
    supplier: 'Tata Tiscon Direct',
    site: 'Site Alpha',
    material: 'TMT Steel Bars 12mm',
    expectedQty: 10,
    receivedQty: 0,
    unit: 'Tons',
    status: 'In Transit',
    expectedDate: '11 Mar 2025',
    invoiceNo: 'TT-CHE-8902',
  },
];

const initialPhotos: SitePhoto[] = [
  {
    id: 'p-1',
    title: 'Cement Unloading - Truck TN09-BX-4421',
    site: 'Site Alpha',
    type: 'Stock In',
    timestamp: '08 Mar 2025, 02:45 PM',
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300&auto=format&fit=crop&q=80',
    uploader: 'Rajesh Kumar',
  },
];

const initialAlerts: LowStockAlertItem[] = [
  { id: 'alt-1', material: 'TMT Steel Bars 12mm', site: 'Site Alpha', currentStock: 8.5, reorderLevel: 15, unit: 'Tons', status: 'Critical', recommendation: 'Order 15 Tons immediately' },
  { id: 'alt-2', material: 'Berger Weathercoat Paint', site: 'Site Alpha', currentStock: 0, reorderLevel: 50, unit: 'Litres', status: 'Critical', recommendation: 'Out of stock! Procurement needed' },
];

const initialActivities: ActivityItem[] = [
  { id: 'a-1', text: 'Stock In: 300 Bags UltraTech Cement', subtext: 'Site Alpha | Truck TN-09-BX-4421', site: 'Site Alpha', time: '10m ago', type: 'stock_in' },
  { id: 'a-2', text: 'Material Request REQ-2025-001 created', subtext: '10 Tons TMT Steel 12mm | Pending', site: 'Site Alpha', time: '45m ago', type: 'request' },
];

const MobileDataContext = createContext<MobileDataContextType | undefined>(undefined);

export const MobileDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [roleMode, setRoleMode] = useState<MobileRoleMode>('admin');
  const [selectedSite, setSelectedSite] = useState<string>('All Sites');
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  const [sites, setSites] = useState<Site[]>(initialSites);
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [materialRequests, setMaterialRequests] = useState<MaterialRequest[]>(initialRequests);
  const [deliveries, setDeliveries] = useState<Delivery[]>(initialDeliveries);
  const [photos, setPhotos] = useState<SitePhoto[]>(initialPhotos);
  const [lowStockAlerts, setLowStockAlerts] = useState<LowStockAlertItem[]>(initialAlerts);
  const [activities, setActivities] = useState<ActivityItem[]>(initialActivities);

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
