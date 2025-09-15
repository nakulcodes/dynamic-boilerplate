import { Injectable } from '@nestjs/common';
import {
  PERMISSIONS,
  getAllPermissions,
  getPermissionsByResource,
  parsePermission,
} from '../../common/rbac/permissions';

@Injectable()
export class PermissionService {
  /**
   * Get all available permissions
   */
  getAllPermissions(): string[] {
    return getAllPermissions();
  }

  /**
   * Get permissions grouped by resource
   */
  getPermissionsGrouped(): Record<string, string[]> {
    const grouped: Record<string, string[]> = {};

    Object.entries(PERMISSIONS).forEach(([resource, permissions]) => {
      grouped[resource.toLowerCase()] = Object.values(permissions);
    });

    return grouped;
  }

  /**
   * Get permissions for a specific resource
   */
  getResourcePermissions(resource: string): string[] {
    return getPermissionsByResource(resource);
  }

  /**
   * Get permission details
   */
  getPermissionDetails(permission: string): {
    permission: string;
    resource: string;
    action: string;
    description: string;
  } {
    const { resource, action } = parsePermission(permission);

    return {
      permission,
      resource,
      action,
      description: this.generateDescription(resource, action),
    };
  }

  /**
   * Get all permissions with details
   */
  getAllPermissionsWithDetails(): Array<{
    permission: string;
    resource: string;
    action: string;
    description: string;
  }> {
    return getAllPermissions().map(permission => this.getPermissionDetails(permission));
  }

  /**
   * Search permissions by keyword
   */
  searchPermissions(keyword: string): string[] {
    const lowerKeyword = keyword.toLowerCase();
    return getAllPermissions().filter(permission =>
      permission.toLowerCase().includes(lowerKeyword),
    );
  }

  /**
   * Generate human-readable description for a permission
   */
  private generateDescription(resource: string, action: string): string {
    const descriptions: Record<string, Record<string, string>> = {
      users: {
        read: 'View user information',
        write: 'Modify user information',
        create: 'Create new users',
        update: 'Update existing users',
        delete: 'Delete users',
        manage_roles: 'Manage user roles',
        reset_password: 'Reset user passwords',
        export: 'Export user data',
      },
      roles: {
        read: 'View roles',
        write: 'Modify roles',
        create: 'Create new roles',
        update: 'Update existing roles',
        delete: 'Delete roles',
        assign: 'Assign roles to users',
        revoke: 'Revoke roles from users',
      },
      content: {
        read: 'View content',
        write: 'Modify content',
        create: 'Create new content',
        update: 'Update existing content',
        delete: 'Delete content',
        publish: 'Publish content',
        unpublish: 'Unpublish content',
        approve: 'Approve content for publication',
      },
      reports: {
        read: 'View reports',
        create: 'Create new reports',
        export: 'Export reports',
        schedule: 'Schedule report generation',
        view_all: 'View all reports',
        view_own: 'View own reports only',
      },
      system: {
        read_logs: 'View system logs',
        manage_settings: 'Manage system settings',
        view_analytics: 'View system analytics',
        backup: 'Create system backups',
        maintenance: 'Perform system maintenance',
        audit_trail: 'View audit trail',
        manage_integrations: 'Manage external integrations',
      },
      api: {
        read: 'View API information',
        create_token: 'Create API tokens',
        revoke_token: 'Revoke API tokens',
        manage_webhooks: 'Manage webhooks',
        view_metrics: 'View API metrics',
      },
      notifications: {
        read: 'View notifications',
        send: 'Send notifications',
        manage: 'Manage notification settings',
        broadcast: 'Send broadcast notifications',
      },
      files: {
        read: 'View files',
        upload: 'Upload files',
        delete: 'Delete files',
        download: 'Download files',
        share: 'Share files',
      },
      settings: {
        read: 'View settings',
        update: 'Update settings',
        manage_global: 'Manage global settings',
        manage_security: 'Manage security settings',
      },
      auth: {
        login: 'User login',
        logout: 'User logout',
        refresh_token: 'Refresh authentication token',
        reset_password: 'Reset password',
        change_password: 'Change password',
        verify_email: 'Verify email address',
        two_factor: 'Manage two-factor authentication',
        manage_sessions: 'Manage user sessions',
      },
    };

    const resourceDescriptions = descriptions[resource.toLowerCase()];
    if (resourceDescriptions && resourceDescriptions[action.toLowerCase()]) {
      return resourceDescriptions[action.toLowerCase()];
    }

    // Generate default description
    return `${action.charAt(0).toUpperCase() + action.slice(1)} ${resource}`;
  }
}