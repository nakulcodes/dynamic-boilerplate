# RBAC System Module

A comprehensive Role-Based Access Control (RBAC) system for NestJS applications, providing flexible permission management, role hierarchy, and easy-to-use decorators for protecting your API endpoints.

## Features

- 🔐 **Complete RBAC Implementation**: Full role and permission management system
- 🎯 **Flexible Permission System**: Resource:action format (e.g., `users:create`, `content:publish`)
- 📊 **Role Hierarchy**: Priority-based role system with inheritance
- 🛡️ **Global Protection**: Automatic RBAC guard for all routes
- 🎨 **Easy-to-Use Decorators**: Simple decorators for permission and role checking
- 💾 **Database Persistence**: TypeORM entities for roles and permissions
- 🌱 **Seed Data**: Pre-configured roles and permissions for quick start
- ✅ **TypeScript Support**: Full type safety with interfaces
- 🔄 **Extensible**: Easy to add custom permissions and roles

## Installation

This module is automatically installed when you select it during project generation. It will:

1. Add required dependencies
2. Create RBAC entities, services, and controllers
3. Set up global RBAC guard
4. Generate database migrations
5. Seed default roles and permissions

## Default Roles

The module comes with 6 pre-configured roles:

| Role | Priority | Description |
|------|----------|-------------|
| **Super Admin** | 1000 | Full system access with wildcard permission (`*:*`) |
| **Admin** | 900 | Administrative access to most features |
| **Manager** | 700 | Management access with content and user oversight |
| **Editor** | 500 | Content creation and editing permissions |
| **Viewer** | 300 | Read-only access to content |
| **User** | 100 | Basic user with minimal permissions |

## Permission Structure

Permissions follow the `resource:action` format:

- `users:create` - Create new users
- `content:publish` - Publish content
- `reports:export` - Export reports
- `system:backup` - Create system backups

### Available Resources

- **users** - User management
- **roles** - Role and permission management
- **content** - Content management
- **reports** - Reports and analytics
- **system** - System administration
- **api** - API management
- **notifications** - Notification system
- **files** - File management
- **settings** - Application settings
- **auth** - Authentication and security

## Usage

### Protecting Routes with Decorators

```typescript
import { Controller, Get, Post } from '@nestjs/common';
import {
  RequirePermissions,
  RequireRoles,
  RequireAdmin,
  Public
} from '@common/decorators/permissions.decorator';
import { PERMISSIONS } from '@common/rbac/permissions';

@Controller('articles')
export class ArticleController {

  // Public route - no authentication required
  @Get('public')
  @Public()
  getPublicArticles() {
    return 'Public content';
  }

  // Require specific permission
  @Get()
  @RequirePermissions(PERMISSIONS.CONTENT.READ)
  getArticles() {
    return 'Protected content';
  }

  // Require multiple permissions (ALL required)
  @Post()
  @RequirePermissions([
    PERMISSIONS.CONTENT.CREATE,
    PERMISSIONS.CONTENT.PUBLISH
  ], PermissionRequirement.ALL)
  createAndPublish() {
    return 'Created and published';
  }

  // Require any of the specified permissions
  @Get('reports')
  @RequirePermissions([
    PERMISSIONS.REPORTS.VIEW_ALL,
    PERMISSIONS.REPORTS.VIEW_OWN
  ], PermissionRequirement.ANY)
  getReports() {
    return 'Reports';
  }

  // Require specific role
  @Delete(':id')
  @RequireAdmin()
  deleteArticle() {
    return 'Deleted';
  }

  // Require any of specified roles
  @Put(':id')
  @RequireRoles(['editor', 'manager', 'admin'], RoleRequirement.ANY)
  updateArticle() {
    return 'Updated';
  }
}
```

### Using Convenience Decorators

```typescript
// User management
@CanReadUsers()        // Requires users:read
@CanCreateUsers()      // Requires users:create
@CanUpdateUsers()      // Requires users:update
@CanDeleteUsers()      // Requires users:delete
@CanManageUserRoles()  // Requires users:manage_roles

// Content management
@CanReadContent()      // Requires content:read
@CanCreateContent()    // Requires content:create
@CanPublishContent()   // Requires content:publish
@CanApproveContent()   // Requires content:approve

// Role-based
@RequireAdmin()        // Requires admin or super_admin role
@RequireManager()      // Requires manager, admin, or super_admin role
@RequireEditor()       // Requires editor role or higher
```

### Programmatic Permission Checking

```typescript
import { Injectable } from '@nestjs/common';
import { RoleService } from '@modules/role/role.service';
import { PermissionService } from '@modules/permission/permission.service';

@Injectable()
export class MyService {
  constructor(
    private roleService: RoleService,
    private permissionService: PermissionService,
  ) {}

  async checkUserPermissions(userId: string) {
    // Get user's role
    const user = await this.userService.findOne(userId);
    const role = await this.roleService.findOne(user.roleId);

    // Check if role has specific permission
    const hasPermission = role.permissions.includes('content:publish');

    // Get all available permissions
    const allPermissions = this.permissionService.getAllPermissions();

    // Search permissions
    const contentPermissions = this.permissionService.searchPermissions('content');

    return { hasPermission, allPermissions, contentPermissions };
  }
}
```

## API Endpoints

### Roles API

- `GET /roles` - Get all roles (requires `roles:read`)
- `GET /roles/:id` - Get role by ID (requires `roles:read`)
- `POST /roles` - Create new role (requires `roles:create`)
- `PATCH /roles/:id` - Update role (requires `roles:update`)
- `DELETE /roles/:id` - Delete role (requires admin role)
- `GET /roles/system` - Get system roles (requires `roles:read`)
- `GET /roles/permissions` - Get all available permissions (requires `roles:read`)

### Permissions API

- `GET /permissions` - Get all permissions (requires `roles:read`)
- `GET /permissions/grouped` - Get permissions grouped by resource
- `GET /permissions/details` - Get permissions with descriptions
- `GET /permissions/search?keyword=content` - Search permissions
- `GET /permissions/resource/:resource` - Get permissions for a resource
- `GET /permissions/:permission` - Get permission details

## Customization

### Adding New Permissions

Edit `src/common/rbac/permissions.ts`:

```typescript
export const PERMISSIONS = {
  // ... existing permissions ...

  // Add your custom resource
  CUSTOM_RESOURCE: {
    READ: 'custom_resource:read',
    WRITE: 'custom_resource:write',
    DELETE: 'custom_resource:delete',
    SPECIAL_ACTION: 'custom_resource:special_action',
  },
};
```

### Adding New Roles

Edit `src/common/rbac/roles.ts`:

```typescript
export const ROLES = {
  // ... existing roles ...

  CUSTOM_ROLE: {
    name: 'custom_role',
    displayName: 'Custom Role',
    description: 'Description of custom role',
    permissions: [
      PERMISSIONS.CUSTOM_RESOURCE.READ,
      PERMISSIONS.CUSTOM_RESOURCE.WRITE,
      // ... other permissions
    ],
    isSystem: false, // Set to true to prevent deletion
    priority: 600,   // Higher number = higher priority
  },
};
```

### Creating Custom Decorators

```typescript
// src/common/decorators/custom.decorator.ts
import { RequirePermissions } from './permissions.decorator';
import { PERMISSIONS } from '../rbac/permissions';

export const CanManageCustomResource = () =>
  RequirePermissions([
    PERMISSIONS.CUSTOM_RESOURCE.READ,
    PERMISSIONS.CUSTOM_RESOURCE.WRITE,
    PERMISSIONS.CUSTOM_RESOURCE.DELETE,
  ], PermissionRequirement.ALL);
```

## Environment Variables

```env
# RBAC Configuration
RBAC_SUPER_ADMIN_EMAIL=admin@example.com
RBAC_SUPER_ADMIN_PASSWORD=SecurePassword@123
RBAC_DEFAULT_ROLE=user
```

## Database Schema

### Role Entity

```typescript
{
  id: UUID
  name: string (unique)
  displayName?: string
  description?: string
  isActive: boolean
  isSystem: boolean
  priority: number
  permissions: string[]
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}
```

### User-Role Relationship

The User entity should have a relationship with the Role entity:

```typescript
@ManyToOne(() => Role)
role: Role;
```

## Security Considerations

1. **Super Admin Protection**: Super admin users bypass all permission checks
2. **System Roles**: System roles cannot be deleted or have their core permissions modified
3. **Role Priority**: Higher priority roles can manage lower priority roles
4. **Wildcard Permissions**: The `*:*` permission grants access to everything
5. **Public Routes**: Use `@Public()` decorator carefully for routes that don't require authentication

## Troubleshooting

### Common Issues

1. **"Access denied" errors**
   - Check if the user has the required permissions
   - Verify the role is active and properly assigned
   - Check if the route has the correct decorators

2. **Permissions not working**
   - Ensure the global RBAC guard is registered in app.module.ts
   - Verify JWT authentication is working properly
   - Check if the user object has the role and permissions populated

3. **Cannot create/modify roles**
   - System roles cannot be modified
   - Check if the user has the required permissions
   - Verify the permissions being assigned are valid

## Migration from Basic Auth

If you're migrating from a basic authentication system:

1. Run the RBAC seed to create default roles
2. Assign roles to existing users
3. Update your controllers to use RBAC decorators
4. Remove old authorization logic

## Support

For issues or questions about the RBAC module, please check:
- The module documentation
- The example implementations in the codebase
- The API documentation at `/api-docs` when running the application

## License

This module is part of the Dynamic Boilerplate Generator and follows the same license terms.