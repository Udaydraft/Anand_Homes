export type StockStatus = 'Good' | 'Medium' | 'Low' | 'Out of Stock';

export interface Site {
  id: string;
  code: string;
  name: string;
  location: string;
  supervisor: string;
  supervisorId?: string;
  supervisorEmail?: string;
  adminId?: string;
  adminEmail?: string;
  createdBy?: string;
  status: 'Active' | 'Inactive';
  totalMaterials: number;
  stockValue: number;
  stockValueFormatted: string;
  imageUrl?: string;
  startDate?: string;
  contact?: string;
  projectType?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Cement' | 'Steel' | 'Aggregate' | 'Masonry' | 'Finishing' | 'Others';
  unit: string;
  totalStock: number;
  minStock: number;
  status: StockStatus;
  site: string;
}

export interface MaterialRequest {
  id: string;
  requestId: string;
  site: string;
  material: string;
  quantity: number;
  unit: string;
  requestedBy: string;
  requestedOn: string;
  requiredDate?: string;
  purpose?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  notes?: string;
  attachments?: string;
}

export interface Delivery {
  id: string;
  deliveryId: string;
  supplier: string;
  site: string;
  material: string;
  expectedQty: number;
  receivedQty: number;
  unit: string;
  status: 'Expected' | 'In Transit' | 'Received' | 'Cancelled';
  expectedDate?: string;
  receivedOn?: string;
  invoiceNo?: string;
  receivedBy?: string;
  shortage?: string;
  photos?: string[];
}

export interface SitePhoto {
  id: string;
  title: string;
  site: string;
  type: 'Stock In' | 'Stock Out' | 'Site Progress';
  timestamp: string;
  imageUrl: string;
  uploader?: string;
}

export interface LowStockAlertItem {
  id: string;
  material: string;
  site: string;
  currentStock: number;
  reorderLevel: number;
  unit: string;
  status: 'Low' | 'Medium' | 'Critical';
  recommendation: string;
}

export interface ActivityItem {
  id: string;
  text: string;
  subtext?: string;
  site: string;
  time: string;
  type: 'stock_in' | 'stock_out' | 'request' | 'delivery' | 'photo';
}
