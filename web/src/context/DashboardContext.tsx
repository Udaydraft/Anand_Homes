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
    stockValueFormatted: '₹8,24,500',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=600&auto=format&fit=crop&q=80',
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
    stockValueFormatted: '₹6,61,200',
    imageUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&auto=format&fit=crop&q=80',
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
    stockValueFormatted: '₹6,45,000',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&auto=format&fit=crop&q=80',
    startDate: '05 Mar 2025',
    contact: '98765 43212',
    projectType: 'Villa Construction Project',
  },
];

const initialInventory: InventoryItem[] = [
  {
    id: 'inv-1',
    name: 'UltraTech PPC Cement',
    category: 'Cement',
    unit: 'Bags',
    totalStock: 420,
    minStock: 100,
    status: 'Good',
    site: 'Site Alpha',
  },
  {
    id: 'inv-2',
    name: 'TMT Steel Bars 12mm',
    category: 'Steel',
    unit: 'Tons',
    totalStock: 8.5,
    minStock: 15,
    status: 'Low',
    site: 'Site Alpha',
  },
  {
    id: 'inv-3',
    name: 'River Sand (Coarse)',
    category: 'Aggregate',
    unit: 'Cu.ft',
    totalStock: 1200,
    minStock: 400,
    status: 'Good',
    site: 'Site Alpha',
  },
  {
    id: 'inv-4',
    name: 'Red Clay Bricks',
    category: 'Masonry',
    unit: 'Pieces',
    totalStock: 4500,
    minStock: 1000,
    status: 'Good',
    site: 'Site Alpha',
  },
  {
    id: 'inv-5',
    name: 'Berger Weathercoat Paint',
    category: 'Finishing',
    unit: 'Litres',
    totalStock: 0,
    minStock: 50,
    status: 'Out of Stock',
    site: 'Site Alpha',
  },
  {
    id: 'inv-6',
    name: 'UltraTech Super Cement',
    category: 'Cement',
    unit: 'Bags',
    totalStock: 310,
    minStock: 120,
    status: 'Good',
    site: 'Site Beta',
  },
  {
    id: 'inv-7',
    name: 'TMT Steel Bars 16mm',
    category: 'Steel',
    unit: 'Tons',
    totalStock: 4.2,
    minStock: 10,
    status: 'Low',
    site: 'Site Beta',
  },
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
  {
    id: 'req-2',
    requestId: 'REQ-2025-002',
    site: 'Site Beta',
    material: 'UltraTech Super Cement',
    quantity: 200,
    unit: 'Bags',
    requestedBy: 'Siva Kumar (Supervisor)',
    requestedOn: '08 Mar 2025, 03:15 PM',
    requiredDate: '12 Mar 2025',
    purpose: 'Brickwork for boundary wall',
    status: 'Approved',
    notes: 'PO sent to Dalmia distributors',
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
  {
    id: 'del-2',
    deliveryId: 'DEL-2025-088',
    supplier: 'UltraTech Cements Hub',
    site: 'Site Alpha',
    material: 'UltraTech PPC Cement',
    expectedQty: 300,
    receivedQty: 300,
    unit: 'Bags',
    status: 'Received',
    receivedOn: '08 Mar 2025, 02:40 PM',
    invoiceNo: 'UTC-2025-110',
    receivedBy: 'Rajesh Kumar',
  },
];

const initialPhotos: SitePhoto[] = [
  {
    id: 'p-1',
    title: 'Cement Unloading - Truck TN09-BX-4421',
    site: 'Site Alpha',
    type: 'Stock In',
    timestamp: '08 Mar 2025, 02:45 PM',
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80',
    uploader: 'Rajesh Kumar',
  },
  {
    id: 'p-2',
    title: '2nd Floor Slab Shuttering Progress',
    site: 'Site Alpha',
    type: 'Site Progress',
    timestamp: '07 Mar 2025, 11:30 AM',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=600&auto=format&fit=crop&q=80',
    uploader: 'Ramesh E (Site Eng)',
  },
];

const initialActivities: ActivityItem[] = [
  { id: 'a-1', text: 'Stock In: 300 Bags UltraTech Cement', subtext: 'Site Alpha | Truck TN-09-BX-4421', site: 'Site Alpha', time: '10m ago', type: 'stock_in' },
  { id: 'a-2', text: 'Material Request REQ-2025-001 created', subtext: '10 Tons TMT Steel 12mm | Pending', site: 'Site Alpha', time: '45m ago', type: 'request' },
  { id: 'a-3', text: 'Stock Out: 40 Bags Cement issued', subtext: 'Site Alpha | Foundation work', site: 'Site Alpha', time: '2h ago', type: 'stock_out' },
];

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [roleMode, setRoleMode] = useState<UserRoleMode>('admin');
  const [selectedSite, setSelectedSite] = useState<string>('All Sites');
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('2025-05-28');
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  // Data collections
  const [sites, setSites] = useState<Site[]>(initialSites);
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [materialRequests, setMaterialRequests] = useState<MaterialRequest[]>(initialRequests);
  const [deliveries, setDeliveries] = useState<Delivery[]>(initialDeliveries);
  const [photos, setPhotos] = useState<SitePhoto[]>(initialPhotos);
  const [lowStockAlerts, setLowStockAlerts] = useState<LowStockAlertItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>(initialActivities);

  // Compute site names list
  const sitesList = ['All Sites', ...sites.map((s) => s.name)];

  // Fetch all data from backend API
  const refreshData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      // 1. Sites
      const backendSites = await constructionService.getSites();
      if (backendSites && backendSites.length > 0) {
        setSites(backendSites);
      }

      // 2. Inventory
      const backendInv = await constructionService.getInventory(selectedSite);
      if (backendInv) {
        setInventory(backendInv);
      }

      // 3. Low stock alerts
      const backendAlerts = await constructionService.getLowStock(selectedSite);
      if (backendAlerts) {
        setLowStockAlerts(backendAlerts);
      }

      // 4. Requests
      const backendReqs = await constructionService.getRequests(selectedSite);
      if (backendReqs) {
        setMaterialRequests(backendReqs);
      }

      // 5. Deliveries
      const backendDelivs = await constructionService.getDeliveries(selectedSite);
      if (backendDelivs) {
        setDeliveries(backendDelivs);
      }

      // 6. Photos
      const backendPhotos = await constructionService.getPhotos(selectedSite);
      if (backendPhotos) {
        setPhotos(backendPhotos);
      }

      // 7. Activities
      const backendActs = await constructionService.getActivities(selectedSite);
      if (backendActs && backendActs.length > 0) {
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
