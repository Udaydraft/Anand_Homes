export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiErrorDetail {
  loc?: (string | number)[];
  msg: string;
  type?: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  detail?: string | ApiErrorDetail[];
}

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
  database: {
    status: 'connected' | 'disconnected';
    details?: string;
  };
}
