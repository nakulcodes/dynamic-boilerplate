import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RbacGuard } from '@common/guards/rbac.guard';
import { RequirePermissions, RequireAdmin } from '@common/decorators/permissions.decorator';
import { PERMISSIONS } from '@common/rbac/permissions';

@ApiTags('Roles')
@ApiBearerAuth()
@Controller('roles')
@UseGuards(JwtAuthGuard, RbacGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @RequirePermissions(PERMISSIONS.ROLES.CREATE)
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, description: 'Role created successfully', type: Role })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Role already exists' })
  create(@Body() createRoleDto: CreateRoleDto): Promise<Role> {
    return this.roleService.create(createRoleDto);
  }

  @Get()
  @RequirePermissions(PERMISSIONS.ROLES.READ)
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({ status: 200, description: 'List of roles' })
  findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.roleService.findAll(page, limit);
  }

  @Get('permissions')
  @RequirePermissions(PERMISSIONS.ROLES.READ)
  @ApiOperation({ summary: 'Get all available permissions' })
  @ApiResponse({ status: 200, description: 'List of permissions', type: [String] })
  getPermissions(): Promise<string[]> {
    return this.roleService.getPermissions();
  }

  @Get('system')
  @RequirePermissions(PERMISSIONS.ROLES.READ)
  @ApiOperation({ summary: 'Get system roles' })
  @ApiResponse({ status: 200, description: 'List of system roles', type: [Role] })
  getSystemRoles(): Promise<Role[]> {
    return this.roleService.getSystemRoles();
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.ROLES.READ)
  @ApiOperation({ summary: 'Get a role by ID' })
  @ApiResponse({ status: 200, description: 'Role details', type: Role })
  @ApiResponse({ status: 404, description: 'Role not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Role> {
    return this.roleService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.ROLES.UPDATE)
  @ApiOperation({ summary: 'Update a role' })
  @ApiResponse({ status: 200, description: 'Role updated successfully', type: Role })
  @ApiResponse({ status: 400, description: 'Cannot modify system roles' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<Role> {
    return this.roleService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @RequireAdmin()
  @ApiOperation({ summary: 'Delete a role' })
  @ApiResponse({ status: 200, description: 'Role deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete system roles or roles in use' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
    return this.roleService.remove(id);
  }

  @Post(':id/permissions')
  @RequirePermissions(PERMISSIONS.ROLES.UPDATE)
  @ApiOperation({ summary: 'Assign permissions to a role' })
  @ApiResponse({ status: 200, description: 'Permissions assigned successfully', type: Role })
  @ApiResponse({ status: 400, description: 'Invalid permissions or system role' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  assignPermissions(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('permissions') permissions: string[],
  ): Promise<Role> {
    return this.roleService.assignPermissions(id, permissions);
  }

  @Post(':id/permissions/:permission')
  @RequirePermissions(PERMISSIONS.ROLES.UPDATE)
  @ApiOperation({ summary: 'Add a permission to a role' })
  @ApiResponse({ status: 200, description: 'Permission added successfully', type: Role })
  @ApiResponse({ status: 400, description: 'Invalid permission or system role' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  addPermission(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('permission') permission: string,
  ): Promise<Role> {
    return this.roleService.addPermission(id, permission);
  }

  @Delete(':id/permissions/:permission')
  @RequirePermissions(PERMISSIONS.ROLES.UPDATE)
  @ApiOperation({ summary: 'Remove a permission from a role' })
  @ApiResponse({ status: 200, description: 'Permission removed successfully', type: Role })
  @ApiResponse({ status: 400, description: 'Cannot modify system role' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  removePermission(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('permission') permission: string,
  ): Promise<Role> {
    return this.roleService.removePermission(id, permission);
  }
}