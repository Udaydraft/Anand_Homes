export type UserRole = 'user' | 'admin' | 'moderator';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfileUpdate {
  name?: string;
  email?: string;
}
