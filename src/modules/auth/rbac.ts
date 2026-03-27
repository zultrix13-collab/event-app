export type Permission =
  | 'users:read'
  | 'users:write'
  | 'reports:read'
  | 'content:write'
  | 'events:read'
  | 'events:write'
  | 'blue_zone:access'
  | 'priority_notification'
  | 'vip_services'
  | 'programme:read'
  | 'services:read'
  | 'notifications:read'
  | 'green_zone:access'
  | 'admin:all';

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  super_admin: [
    'admin:all',
    'users:read',
    'users:write',
    'reports:read',
    'content:write',
    'events:read',
    'events:write',
    'blue_zone:access',
    'priority_notification',
    'vip_services',
    'programme:read',
    'services:read',
    'notifications:read',
    'green_zone:access',
  ],
  specialist: [
    'users:read',
    'reports:read',
    'content:write',
    'events:read',
    'programme:read',
    'services:read',
    'notifications:read',
  ],
  vip: [
    'blue_zone:access',
    'priority_notification',
    'vip_services',
    'programme:read',
    'services:read',
    'notifications:read',
    'green_zone:access',
  ],
  participant: ['programme:read', 'services:read', 'notifications:read', 'green_zone:access'],
};

export function hasPermission(role: string, permission: Permission): boolean {
  const perms = ROLE_PERMISSIONS[role] ?? [];
  return perms.includes('admin:all') || perms.includes(permission);
}

export function getRoleRedirect(role: string): string {
  switch (role) {
    case 'super_admin':
      return '/admin/dashboard';
    case 'specialist':
      return '/specialist/dashboard';
    case 'vip':
      return '/app/home?zone=blue';
    default:
      return '/app/home';
  }
}
