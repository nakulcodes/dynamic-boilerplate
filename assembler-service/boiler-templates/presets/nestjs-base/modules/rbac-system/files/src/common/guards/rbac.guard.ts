import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  PERMISSIONS_KEY,
  ROLES_KEY,
  IS_PUBLIC_KEY,
  PermissionMetadata,
  RoleMetadata,
  PermissionRequirement,
  RoleRequirement,
} from '../decorators/permissions.decorator';
import { AuthenticatedUser, RoleInfo } from '../types/user.types';
import { permissionMatches } from '../rbac/permissions';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const permissionsMetadata = this.reflector.getAllAndOverride<PermissionMetadata>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    const rolesMetadata = this.reflector.getAllAndOverride<RoleMetadata>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no permissions or roles are required, allow access for authenticated users
    if (!permissionsMetadata && !rolesMetadata) {
      const request = context.switchToHttp().getRequest();
      const user = request.user;

      if (!user) {
        throw new UnauthorizedException('Authentication required');
      }

      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser;

    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    // Super admins bypass all checks
    if (user.isSuperAdmin) {
      return true;
    }

    // Check role requirements
    if (rolesMetadata) {
      const hasRequiredRoles = this.checkRoles(user, rolesMetadata);
      if (!hasRequiredRoles) {
        const roleList = rolesMetadata.roles.join(', ');
        const requirementText = rolesMetadata.requirement === RoleRequirement.ALL ? 'all' : 'one';
        throw new ForbiddenException(
          `Access denied. Requires ${requirementText} of the following roles: ${roleList}`,
        );
      }
    }

    // Check permission requirements
    if (permissionsMetadata) {
      const hasRequiredPermissions = this.checkPermissions(user, permissionsMetadata);
      if (!hasRequiredPermissions) {
        const permissionList = permissionsMetadata.permissions.join(', ');
        const requirementText =
          permissionsMetadata.requirement === PermissionRequirement.ALL ? 'all' : 'one';
        throw new ForbiddenException(
          `Access denied. Requires ${requirementText} of the following permissions: ${permissionList}`,
        );
      }
    }

    return true;
  }

  private checkRoles(user: AuthenticatedUser, rolesMetadata: RoleMetadata): boolean {
    const { roles: requiredRoles, requirement } = rolesMetadata;
    const userRoles = this.getUserRoles(user);

    if (requirement === RoleRequirement.ALL) {
      // User must have ALL required roles
      return requiredRoles.every(role => userRoles.includes(role));
    } else {
      // User must have ANY of the required roles
      return requiredRoles.some(role => userRoles.includes(role));
    }
  }

  private checkPermissions(
    user: AuthenticatedUser,
    permissionsMetadata: PermissionMetadata,
  ): boolean {
    const { permissions: requiredPermissions, requirement } = permissionsMetadata;
    const userPermissions = this.getUserPermissions(user);

    if (requirement === PermissionRequirement.ALL) {
      // User must have ALL required permissions
      return requiredPermissions.every(requiredPermission =>
        userPermissions.some(userPermission =>
          permissionMatches(requiredPermission, userPermission),
        ),
      );
    } else {
      // User must have ANY of the required permissions
      return requiredPermissions.some(requiredPermission =>
        userPermissions.some(userPermission =>
          permissionMatches(requiredPermission, userPermission),
        ),
      );
    }
  }

  private getUserRoles(user: AuthenticatedUser): string[] {
    const roles: string[] = [];

    // Add role from user.role if exists
    if (user.role?.name) {
      roles.push(user.role.name);
    }

    // Add roles from user.roles if it's an array
    if (Array.isArray(user.roles)) {
      user.roles.forEach((role: string | RoleInfo) => {
        if (typeof role === 'string') {
          roles.push(role);
        } else if (role?.name) {
          roles.push(role.name);
        }
      });
    }

    return [...new Set(roles)]; // Remove duplicates
  }

  private getUserPermissions(user: AuthenticatedUser): string[] {
    const permissions: string[] = [];

    // Add direct permissions if exists
    if (Array.isArray(user.permissions)) {
      permissions.push(...user.permissions);
    }

    // Add permissions from role
    if (user.role?.permissions && Array.isArray(user.role.permissions)) {
      permissions.push(...user.role.permissions);
    }

    // Add permissions from roles array
    if (Array.isArray(user.roles)) {
      user.roles.forEach((role: string | RoleInfo) => {
        if (typeof role !== 'string' && role?.permissions) {
          permissions.push(...role.permissions);
        }
      });
    }

    return [...new Set(permissions)]; // Remove duplicates
  }
}