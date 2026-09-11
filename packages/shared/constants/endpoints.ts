export const API_ENDPOINTS = {
  HEALTH: '/health',
  API_HEALTH: '/api/health',
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    REFRESH: '/api/auth/refresh',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
  },
  USERS: {
    PROFILE: '/api/users/profile',
  },
  CONSTRUCTION: {
    SITES: '/api/sites',
    INVENTORY: '/api/inventory',
    LOW_STOCK: '/api/inventory/low-stock',
    STOCK_IN: '/api/stock/in',
    STOCK_OUT: '/api/stock/out',
    STOCK_TRANSACTIONS: '/api/stock/transactions',
    REQUESTS: '/api/requests',
    DELIVERIES: '/api/deliveries',
    PHOTOS: '/api/photos',
    ACTIVITIES: '/api/activities',
    SUMMARY: '/api/dashboard/summary',
    SEED: '/api/seed',
  },
} as const;
