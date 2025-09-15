import { PERMISSIONS } from './permissions';

/**
 * Centralized Role Configuration
 *
 * This file defines all default roles and their associated permissions.
 * Roles are hierarchical and follow the principle of least privilege.
 */

export interface RoleDefinition {
  name: string;
  displayName: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  priority: number; // Higher number = higher priority
}

export const ROLE_NAMES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  EDITOR: 'editor',
  VIEWER: 'viewer',
  USER: 'user',
} as const;

export const ROLES: Record<string, RoleDefinition> = {
  [ROLE_NAMES.SUPER_ADMIN]: {
    name: ROLE_NAMES.SUPER_ADMIN,
    displayName: 'Super Administrator',
    description: 'Full system access with all permissions',
    permissions: [
      '*:*' // Wildcard permission - can do everything
    ],
    isSystem: true,
    priority: 1000,
  },

  [ROLE_NAMES.ADMIN]: {
    name: ROLE_NAMES.ADMIN,
    displayName: 'Administrator',
    description: 'Administrative access to most system features',
    permissions: [
      // User Management
      PERMISSIONS.USERS.READ,
      PERMISSIONS.USERS.CREATE,
      PERMISSIONS.USERS.UPDATE,
      PERMISSIONS.USERS.DELETE,
      PERMISSIONS.USERS.MANAGE_ROLES,

      // Role Management (read only)
      PERMISSIONS.ROLES.READ,

      // Content Management
      PERMISSIONS.CONTENT.READ,
      PERMISSIONS.CONTENT.CREATE,
      PERMISSIONS.CONTENT.UPDATE,
      PERMISSIONS.CONTENT.DELETE,
      PERMISSIONS.CONTENT.PUBLISH,
      PERMISSIONS.CONTENT.UNPUBLISH,

      // Reports
      PERMISSIONS.REPORTS.READ,
      PERMISSIONS.REPORTS.CREATE,
      PERMISSIONS.REPORTS.EXPORT,
      PERMISSIONS.REPORTS.VIEW_ALL,

      // System (limited)
      PERMISSIONS.SYSTEM.READ_LOGS,
      PERMISSIONS.SYSTEM.VIEW_ANALYTICS,
      PERMISSIONS.SYSTEM.AUDIT_TRAIL,

      // API Management
      PERMISSIONS.API.READ,
      PERMISSIONS.API.CREATE_TOKEN,
      PERMISSIONS.API.REVOKE_TOKEN,

      // Files
      PERMISSIONS.FILES.READ,
      PERMISSIONS.FILES.UPLOAD,
      PERMISSIONS.FILES.DELETE,
      PERMISSIONS.FILES.DOWNLOAD,

      // Settings
      PERMISSIONS.SETTINGS.READ,
      PERMISSIONS.SETTINGS.UPDATE,

      // Auth
      PERMISSIONS.AUTH.LOGIN,
      PERMISSIONS.AUTH.LOGOUT,
      PERMISSIONS.AUTH.CHANGE_PASSWORD,
    ],
    isSystem: true,
    priority: 900,
  },

  [ROLE_NAMES.MANAGER]: {
    name: ROLE_NAMES.MANAGER,
    displayName: 'Manager',
    description: 'Management access with content and user oversight',
    permissions: [
      // User Management (limited)
      PERMISSIONS.USERS.READ,
      PERMISSIONS.USERS.UPDATE,

      // Content Management
      PERMISSIONS.CONTENT.READ,
      PERMISSIONS.CONTENT.CREATE,
      PERMISSIONS.CONTENT.UPDATE,
      PERMISSIONS.CONTENT.DELETE,
      PERMISSIONS.CONTENT.PUBLISH,
      PERMISSIONS.CONTENT.APPROVE,

      // Reports
      PERMISSIONS.REPORTS.READ,
      PERMISSIONS.REPORTS.CREATE,
      PERMISSIONS.REPORTS.EXPORT,
      PERMISSIONS.REPORTS.VIEW_ALL,

      // Files
      PERMISSIONS.FILES.READ,
      PERMISSIONS.FILES.UPLOAD,
      PERMISSIONS.FILES.DOWNLOAD,

      // Notifications
      PERMISSIONS.NOTIFICATIONS.READ,
      PERMISSIONS.NOTIFICATIONS.SEND,
      PERMISSIONS.NOTIFICATIONS.MANAGE,

      // Settings (read only)
      PERMISSIONS.SETTINGS.READ,

      // Auth
      PERMISSIONS.AUTH.LOGIN,
      PERMISSIONS.AUTH.LOGOUT,
      PERMISSIONS.AUTH.CHANGE_PASSWORD,
    ],
    isSystem: true,
    priority: 700,
  },

  [ROLE_NAMES.EDITOR]: {
    name: ROLE_NAMES.EDITOR,
    displayName: 'Editor',
    description: 'Content creation and editing permissions',
    permissions: [
      // Content Management
      PERMISSIONS.CONTENT.READ,
      PERMISSIONS.CONTENT.CREATE,
      PERMISSIONS.CONTENT.UPDATE,

      // Reports (own content)
      PERMISSIONS.REPORTS.VIEW_OWN,

      // Files
      PERMISSIONS.FILES.READ,
      PERMISSIONS.FILES.UPLOAD,
      PERMISSIONS.FILES.DOWNLOAD,

      // Notifications (read only)
      PERMISSIONS.NOTIFICATIONS.READ,

      // Auth
      PERMISSIONS.AUTH.LOGIN,
      PERMISSIONS.AUTH.LOGOUT,
      PERMISSIONS.AUTH.CHANGE_PASSWORD,
    ],
    isSystem: true,
    priority: 500,
  },

  [ROLE_NAMES.VIEWER]: {
    name: ROLE_NAMES.VIEWER,
    displayName: 'Viewer',
    description: 'Read-only access to content',
    permissions: [
      // Content (read only)
      PERMISSIONS.CONTENT.READ,

      // Reports (own)
      PERMISSIONS.REPORTS.VIEW_OWN,

      // Files (read only)
      PERMISSIONS.FILES.READ,
      PERMISSIONS.FILES.DOWNLOAD,

      // Notifications (read only)
      PERMISSIONS.NOTIFICATIONS.READ,

      // Auth
      PERMISSIONS.AUTH.LOGIN,
      PERMISSIONS.AUTH.LOGOUT,
      PERMISSIONS.AUTH.CHANGE_PASSWORD,
    ],
    isSystem: true,
    priority: 300,
  },

  [ROLE_NAMES.USER]: {
    name: ROLE_NAMES.USER,
    displayName: 'User',
    description: 'Basic user with minimal permissions',
    permissions: [
      // Auth only
      PERMISSIONS.AUTH.LOGIN,
      PERMISSIONS.AUTH.LOGOUT,
      PERMISSIONS.AUTH.CHANGE_PASSWORD,
      PERMISSIONS.AUTH.VERIFY_EMAIL,
    ],
    isSystem: true,
    priority: 100,
  },
};

/**
 * Get all role definitions
 */
export function getAllRoles(): RoleDefinition[] {
  return Object.values(ROLES);
}

/**
 * Get role by name
 */
export function getRoleByName(name: string): RoleDefinition | undefined {
  return ROLES[name];
}

/**
 * Get system roles (built-in roles that cannot be deleted)
 */
export function getSystemRoles(): RoleDefinition[] {
  return Object.values(ROLES).filter(role => role.isSystem);
}

/**
 * Get custom roles (user-created roles that can be modified)
 */
export function getCustomRoles(): RoleDefinition[] {
  return Object.values(ROLES).filter(role => !role.isSystem);
}

/**
 * Check if role exists
 */
export function isValidRole(roleName: string): boolean {
  return roleName in ROLES;
}

/**
 * Get permissions for a role
 */
export function getRolePermissions(roleName: string): string[] {
  const role = ROLES[roleName];
  return role ? role.permissions : [];
}

/**
 * Check if a role has a specific permission
 */
export function roleHasPermission(roleName: string, permission: string): boolean {
  const role = ROLES[roleName];
  if (!role) return false;

  // Check for wildcard permission
  if (role.permissions.includes('*:*')) return true;

  // Check for specific permission
  return role.permissions.includes(permission);
}

/**
 * Get roles sorted by priority (highest first)
 */
export function getRolesByPriority(): RoleDefinition[] {
  return Object.values(ROLES).sort((a, b) => b.priority - a.priority);
}

/**
 * Get the highest priority role from a list of role names
 */
export function getHighestPriorityRole(roleNames: string[]): RoleDefinition | undefined {
  const validRoles = roleNames
    .map(name => ROLES[name])
    .filter(role => role !== undefined);

  if (validRoles.length === 0) return undefined;

  return validRoles.reduce((highest, current) =>
    current.priority > highest.priority ? current : highest
  );
}