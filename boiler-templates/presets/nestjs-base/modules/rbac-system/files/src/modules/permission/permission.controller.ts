import { Controller, Get, Query, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PermissionService } from './permission.service';
import { JwtAuthGuard } from '../../../../../modules/auth/guards/jwt-auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PERMISSIONS } from '../../common/rbac/permissions';

@ApiTags('Permissions')
@ApiBearerAuth()
@Controller('permissions')
@UseGuards(JwtAuthGuard, RbacGuard)
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.ROLES.READ)
  @ApiOperation({ summary: 'Get all available permissions' })
  @ApiResponse({ status: 200, description: 'List of all permissions', type: [String] })
  getAllPermissions(): string[] {
    return this.permissionService.getAllPermissions();
  }

  @Get('grouped')
  @RequirePermissions(PERMISSIONS.ROLES.READ)
  @ApiOperation({ summary: 'Get permissions grouped by resource' })
  @ApiResponse({ status: 200, description: 'Permissions grouped by resource' })
  getPermissionsGrouped(): Record<string, string[]> {
    return this.permissionService.getPermissionsGrouped();
  }

  @Get('details')
  @RequirePermissions(PERMISSIONS.ROLES.READ)
  @ApiOperation({ summary: 'Get all permissions with details' })
  @ApiResponse({ status: 200, description: 'List of permissions with details' })
  getAllPermissionsWithDetails() {
    return this.permissionService.getAllPermissionsWithDetails();
  }

  @Get('search')
  @RequirePermissions(PERMISSIONS.ROLES.READ)
  @ApiOperation({ summary: 'Search permissions by keyword' })
  @ApiResponse({ status: 200, description: 'List of matching permissions', type: [String] })
  searchPermissions(@Query('keyword') keyword: string): string[] {
    return this.permissionService.searchPermissions(keyword);
  }

  @Get('resource/:resource')
  @RequirePermissions(PERMISSIONS.ROLES.READ)
  @ApiOperation({ summary: 'Get permissions for a specific resource' })
  @ApiResponse({ status: 200, description: 'List of resource permissions', type: [String] })
  getResourcePermissions(@Param('resource') resource: string): string[] {
    return this.permissionService.getResourcePermissions(resource);
  }

  @Get(':permission')
  @RequirePermissions(PERMISSIONS.ROLES.READ)
  @ApiOperation({ summary: 'Get details for a specific permission' })
  @ApiResponse({ status: 200, description: 'Permission details' })
  getPermissionDetails(@Param('permission') permission: string) {
    return this.permissionService.getPermissionDetails(permission);
  }
}