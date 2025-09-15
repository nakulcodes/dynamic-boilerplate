/**
 * Centralized Permissions Configuration
 *
 * This file defines all available permissions in the system.
 * Each permission follows the format: RESOURCE:ACTION
 *
 * Customize this file based on your application's needs.
 */

export const PERMISSIONS = {
  // User Management
  USERS: {
    READ: 'users:read',
    WRITE: 'users:write',
    CREATE: 'users:create',
    UPDATE: 'users:update',
    DELETE: 'users:delete',
    MANAGE_ROLES: 'users:manage_roles',
    RESET_PASSWORD: 'users:reset_password',
    EXPORT: 'users:export',
  },

  // Role & Permission Management
  ROLES: {
    READ: 'roles:read',
    WRITE: 'roles:write',
    CREATE: 'roles:create',
    UPDATE: 'roles:update',
    DELETE: 'roles:delete',
    ASSIGN: 'roles:assign',
    REVOKE: 'roles:revoke',
  },

  // Content Management
  CONTENT: {
    READ: 'content:read',
    WRITE: 'content:write',
    CREATE: 'content:create',
    UPDATE: 'content:update',
    DELETE: 'content:delete',
    PUBLISH: 'content:publish',
    UNPUBLISH: 'content:unpublish',
    APPROVE: 'content:approve',
  },

  // Reports & Analytics
  REPORTS: {
    READ: 'reports:read',
    CREATE: 'reports:create',
    EXPORT: 'reports:export',
    SCHEDULE: 'reports:schedule',
    VIEW_ALL: 'reports:view_all',
    VIEW_OWN: 'reports:view_own',
  },

  // System Administration
  SYSTEM: {
    READ_LOGS: 'system:read_logs',
    MANAGE_SETTINGS: 'system:manage_settings',
    VIEW_ANALYTICS: 'system:view_analytics',
    BACKUP: 'system:backup',
    MAINTENANCE: 'system:maintenance',
    AUDIT_TRAIL: 'system:audit_trail',
    MANAGE_INTEGRATIONS: 'system:manage_integrations',
  },

  // API Management
  API: {
    READ: 'api:read',
    CREATE_TOKEN: 'api:create_token',
    REVOKE_TOKEN: 'api:revoke_token',
    MANAGE_WEBHOOKS: 'api:manage_webhooks',
    VIEW_METRICS: 'api:view_metrics',
  },

  // Notifications
  NOTIFICATIONS: {
    READ: 'notifications:read',
    SEND: 'notifications:send',
    MANAGE: 'notifications:manage',
    BROADCAST: 'notifications:broadcast',
  },

  // File Management
  FILES: {
    READ: 'files:read',
    UPLOAD: 'files:upload',
    DELETE: 'files:delete',
    DOWNLOAD: 'files:download',
    SHARE: 'files:share',
  },

  // Settings
  SETTINGS: {
    READ: 'settings:read',
    UPDATE: 'settings:update',
    MANAGE_GLOBAL: 'settings:manage_global',
    MANAGE_SECURITY: 'settings:manage_security',
  },

  // Authentication & Security
  AUTH: {
    LOGIN: 'auth:login',
    LOGOUT: 'auth:logout',
    REFRESH_TOKEN: 'auth:refresh_token',
    RESET_PASSWORD: 'auth:reset_password',
    CHANGE_PASSWORD: 'auth:change_password',
    VERIFY_EMAIL: 'auth:verify_email',
    TWO_FACTOR: 'auth:two_factor',
    MANAGE_SESSIONS: 'auth:manage_sessions',
  },
} as const;

/**
 * Get all permissions as a flat array
 */
export function getAllPermissions(): string[] {
  const permissions: string[] = [];

  Object.values(PERMISSIONS).forEach(resourcePermissions => {
    Object.values(resourcePermissions).forEach(permission => {
      permissions.push(permission);
    });
  });

  return permissions;
}

/**
 * Get permissions by resource
 */
export function getPermissionsByResource(resource: string): string[] {
  const resourceKey = resource.toUpperCase() as keyof typeof PERMISSIONS;
  if (resourceKey in PERMISSIONS) {
    return Object.values(PERMISSIONS[resourceKey]);
  }
  return [];
}

/**
 * Check if a permission exists
 */
export function isValidPermission(permission: string): boolean {
  if (permission === '*:*') return true; // Wildcard permission
  return getAllPermissions().includes(permission);
}

/**
 * Parse permission into resource and action
 */
export function parsePermission(permission: string): { resource: string; action: string } {
  const [resource, action] = permission.split(':');
  return { resource: resource || '', action: action || '' };
}

/**
 * Build permission string from resource and action
 */
export function buildPermission(resource: string, action: string): string {
  return `${resource.toLowerCase()}:${action.toLowerCase()}`;
}

/**
 * Check if a permission matches a pattern (supports wildcards)
 */
export function permissionMatches(permission: string, pattern: string): boolean {
  if (pattern === '*:*') return true;

  const [patternResource, patternAction] = pattern.split(':');
  const [permResource, permAction] = permission.split(':');

  const resourceMatches = patternResource === '*' || patternResource === permResource;
  const actionMatches = patternAction === '*' || patternAction === permAction;

  return resourceMatches && actionMatches;
}