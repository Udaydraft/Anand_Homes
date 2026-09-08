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
} as const;
