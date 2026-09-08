export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
} as const;

export type RoleValue = typeof ROLES[keyof typeof ROLES];
