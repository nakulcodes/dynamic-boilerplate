import { SetMetadata } from '@nestjs/common';
import { PERMISSIONS } from '../rbac';

/**
 * Metadata key for required permissions
 */
export const PERMISSIONS_KEY = 'required_permissions';

/**
 * Metadata key for required roles
 */
export const ROLES_KEY = 'required_roles';

/**
 * Metadata key for public routes
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Permission requirement type
 */
export enum PermissionRequirement {
  ALL = 'ALL', // User must have ALL specified permissions
  ANY = 'ANY', // User must have ANY of the specified permissions
}

/**
 * Role requirement type
 */
export enum RoleRequirement {
  ALL = 'ALL', // User must have ALL specified roles
  ANY = 'ANY', // User must have ANY of the specified roles
}

/**
 * Interface for permission metadata
 */
export interface PermissionMetadata {
  permissions: string[];
  requirement: PermissionRequirement;
}

/**
 * Interface for role metadata
 */
export interface RoleMetadata {
  roles: string[];
  requirement: RoleRequirement;
}

/**
 * Decorator to require specific permissions
 * @param permissions - Array of permission strings or single permission
 * @param requirement - Whether ALL or ANY permissions are required (default: ALL)
 */
export const RequirePermissions = (
  permissions: string | string[],
  requirement: PermissionRequirement = PermissionRequirement.ALL,
) => {
  const permissionArray = Array.isArray(permissions) ? permissions : [permissions];
  const metadata: PermissionMetadata = {
    permissions: permissionArray,
    requirement,
  };
  return SetMetadata(PERMISSIONS_KEY, metadata);
};

/**
 * Decorator to require specific roles
 * @param roles - Array of role strings or single role
 * @param requirement - Whether ALL or ANY roles are required (default: ANY)
 */
export const RequireRoles = (
  roles: string | string[],
  requirement: RoleRequirement = RoleRequirement.ANY,
) => {
  const roleArray = Array.isArray(roles) ? roles : [roles];
  const metadata: RoleMetadata = {
    roles: roleArray,
    requirement,
  };
  return SetMetadata(ROLES_KEY, metadata);
};

/**
 * Decorator to mark a route as public (no authentication required)
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/**
 * Convenience decorators for common permissions
 */

// User management
export const CanReadUsers = () => RequirePermissions(PERMISSIONS.USERS.READ);
export const CanCreateUsers = () => RequirePermissions(PERMISSIONS.USERS.CREATE);
export const CanUpdateUsers = () => RequirePermissions(PERMISSIONS.USERS.UPDATE);
export const CanDeleteUsers = () => RequirePermissions(PERMISSIONS.USERS.DELETE);
export const CanManageUserRoles = () => RequirePermissions(PERMISSIONS.USERS.MANAGE_ROLES);

// Content management
export const CanReadContent = () => RequirePermissions(PERMISSIONS.CONTENT.READ);
export const CanCreateContent = () => RequirePermissions(PERMISSIONS.CONTENT.CREATE);
export const CanUpdateContent = () => RequirePermissions(PERMISSIONS.CONTENT.UPDATE);
export const CanDeleteContent = () => RequirePermissions(PERMISSIONS.CONTENT.DELETE);
export const CanPublishContent = () => RequirePermissions(PERMISSIONS.CONTENT.PUBLISH);
export const CanApproveContent = () => RequirePermissions(PERMISSIONS.CONTENT.APPROVE);

// Role management
export const CanManageRoles = () => RequirePermissions([
  PERMISSIONS.ROLES.CREATE,
  PERMISSIONS.ROLES.UPDATE,
  PERMISSIONS.ROLES.DELETE,
], PermissionRequirement.ANY);

// System administration
export const CanManageSystem = () => RequirePermissions([
  PERMISSIONS.SYSTEM.MANAGE_SETTINGS,
  PERMISSIONS.SYSTEM.BACKUP,
  PERMISSIONS.SYSTEM.MAINTENANCE,
], PermissionRequirement.ANY);

// Reports
export const CanViewReports = () => RequirePermissions([
  PERMISSIONS.REPORTS.VIEW_ALL,
  PERMISSIONS.REPORTS.VIEW_OWN,
], PermissionRequirement.ANY);

// File management
export const CanManageFiles = () => RequirePermissions([
  PERMISSIONS.FILES.UPLOAD,
  PERMISSIONS.FILES.DELETE,
], PermissionRequirement.ANY);

// Role-based access
export const RequireAdmin = () => RequireRoles(['admin', 'super_admin'], RoleRequirement.ANY);
export const RequireManager = () => RequireRoles(['manager', 'admin', 'super_admin'], RoleRequirement.ANY);
export const RequireEditor = () => RequireRoles(['editor', 'manager', 'admin', 'super_admin'], RoleRequirement.ANY);

// Multiple permission examples
export const CanReadOrWrite = (resource: string) =>
  RequirePermissions([`${resource}:read`, `${resource}:write`], PermissionRequirement.ANY);

export const CanFullyManage = (resource: string) =>
  RequirePermissions([
    `${resource}:read`,
    `${resource}:write`,
    `${resource}:create`,
    `${resource}:update`,
    `${resource}:delete`,
  ], PermissionRequirement.ALL);