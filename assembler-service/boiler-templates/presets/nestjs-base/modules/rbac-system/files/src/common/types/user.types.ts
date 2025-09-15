/**
 * User types and interfaces for RBAC system
 */

export interface RoleInfo {
  id: string;
  name: string;
  displayName?: string;
  permissions: string[];
  priority?: number;
  isSystem?: boolean;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  isSuperAdmin?: boolean;
  role?: RoleInfo;
  roles?: (string | RoleInfo)[];
  permissions?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserWithPermissions extends AuthenticatedUser {
  permissions: string[];
  effectiveRole: RoleInfo;
}

export interface TokenPayload {
  sub: string; // User ID
  email: string;
  roles?: string[];
  permissions?: string[];
  isSuperAdmin?: boolean;
  iat?: number;
  exp?: number;
}