export type PropertyType = 'Apartment' | 'Villa' | 'Plot' | 'Commercial';
export type PropertyStatus = 'available' | 'booked' | 'sold';

export interface Property {
  id: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  location: string;
  price: number;
  priceFormatted: string;
  bedrooms: number;
  bathrooms: number;
  areaSqFt: number;
  status: PropertyStatus;
  featured: boolean;
  imageUrl: string;
  galleryImages: string[];
  amenities: string[];
  siteId?: string;
  agentName?: string;
  agentContact?: string;
  createdAt: string;
  isFavorite?: boolean;
}

export interface PropertyFilterQuery {
  search?: string;
  location?: string;
  propertyType?: PropertyType | 'All';
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number | 'All';
  status?: PropertyStatus | 'All';
  page?: number;
  limit?: number;
}

export interface Favorite {
  id: string;
  userId: string;
  propertyId: string;
  createdAt: string;
  property?: Property;
}

export type EnquiryStatus = 'new' | 'in_progress' | 'contacted' | 'closed';

export interface Enquiry {
  id: string;
  propertyId: string;
  propertyTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  message: string;
  status: EnquiryStatus;
  createdAt: string;
  agentNotes?: string;
}

export interface EnquiryCreatePayload {
  propertyId: string;
  message: string;
  phone?: string;
  name?: string;
  email?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export interface UnifiedDashboardData {
  userSummary: {
    name: string;
    email: string;
    role: string;
  };
  propertiesCount: number;
  favoritesCount: number;
  enquiriesCount: number;
  activeSitesCount: number;
  totalMaterialsCount?: number;
  totalStockValueFormatted: string;
  lowStockAlertsCount?: number;
  recentEnquiries: Enquiry[];
  featuredProperties: Property[];
  notifications: NotificationItem[];
}
