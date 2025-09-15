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
import { CreateRoleDto } from './dto/request/create-role.dto';
import { UpdateRoleDto } from './dto/request/update-role.dto';
import { RoleResponseDto } from './dto/response/role-response.dto';
import { PaginatedRolesDto } from './dto/response/paginated-roles.dto';
import { PermissionsResponseDto } from './dto/response/permissions.dto';
import { PaginatedResponseDto } from '../../../../../common/dto/response/api-response.dto';
import { JwtAuthGuard } from '../../../../../modules/auth/guards/jwt-auth.guard';
import { RbacGuard } from '../../../common/guards/rbac.guard';
import { RequirePermissions, RequireAdmin } from '../../../common/decorators/permissions.decorator';
import { PERMISSIONS } from '../../../common/rbac/permissions';

@ApiTags('Roles')
@ApiBearerAuth()
@Controller('roles')
@UseGuards(JwtAuthGuard, RbacGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @RequirePermissions(PERMISSIONS.ROLES.CREATE)
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, description: 'Role created successfully', type: RoleResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Role already exists' })
  async create(@Body() createRoleDto: CreateRoleDto): Promise<RoleResponseDto> {
    const role = await this.roleService.create(createRoleDto);
    return new RoleResponseDto(role);
  }

  @Get()
  @RequirePermissions(PERMISSIONS.ROLES.READ)
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({ status: 200, description: 'List of roles', type: PaginatedRolesDto })
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ): Promise<PaginatedRolesDto> {
    const { items, total, page: currentPage, totalPages } = await this.roleService.findAll(page, limit);
    const currentLimit = limit || 10;
    return new PaginatedRolesDto(items, currentPage, currentLimit, total);
  }

  @Get('permissions')
  @RequirePermissions(PERMISSIONS.ROLES.READ)
  @ApiOperation({ summary: 'Get all available permissions' })
  @ApiResponse({ status: 200, description: 'List of permissions', type: PermissionsResponseDto })
  async getPermissions(): Promise<PermissionsResponseDto> {
    const permissions = await this.roleService.getPermissions();
    return new PermissionsResponseDto(permissions);
  }

  @Get('system')
  @RequirePermissions(PERMISSIONS.ROLES.READ)
  @ApiOperation({ summary: 'Get system roles' })
  @ApiResponse({ status: 200, description: 'List of system roles', type: PaginatedRolesDto })
  async getSystemRoles(): Promise<PaginatedRolesDto> {
    const roles = await this.roleService.getSystemRoles();
    return new PaginatedRolesDto(roles, 1, roles.length, roles.length);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.ROLES.READ)
  @ApiOperation({ summary: 'Get a role by ID' })
  @ApiResponse({ status: 200, description: 'Role details', type: RoleResponseDto })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<RoleResponseDto> {
    const role = await this.roleService.findOne(id);
    return new RoleResponseDto(role);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.ROLES.UPDATE)
  @ApiOperation({ summary: 'Update a role' })
  @ApiResponse({ status: 200, description: 'Role updated successfully', type: RoleResponseDto })
  @ApiResponse({ status: 400, description: 'Cannot modify system roles' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<RoleResponseDto> {
    const role = await this.roleService.update(id, updateRoleDto);
    return new RoleResponseDto(role);
  }

  @Delete(':id')
  @RequireAdmin()
  @ApiOperation({ summary: 'Delete a role' })
  @ApiResponse({ status: 200, description: 'Role deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete system roles or roles in use' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
    return this.roleService.remove(id);
  }

  @Post(':id/permissions')
  @RequirePermissions(PERMISSIONS.ROLES.UPDATE)
  @ApiOperation({ summary: 'Assign permissions to a role' })
  @ApiResponse({ status: 200, description: 'Permissions assigned successfully', type: RoleResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid permissions or system role' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async assignPermissions(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('permissions') permissions: string[],
  ): Promise<RoleResponseDto> {
    const role = await this.roleService.assignPermissions(id, permissions);
    return new RoleResponseDto(role);
  }

  @Post(':id/permissions/:permission')
  @RequirePermissions(PERMISSIONS.ROLES.UPDATE)
  @ApiOperation({ summary: 'Add a permission to a role' })
  @ApiResponse({ status: 200, description: 'Permission added successfully', type: RoleResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid permission or system role' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async addPermission(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('permission') permission: string,
  ): Promise<RoleResponseDto> {
    const role = await this.roleService.addPermission(id, permission);
    return new RoleResponseDto(role);
  }

  @Delete(':id/permissions/:permission')
  @RequirePermissions(PERMISSIONS.ROLES.UPDATE)
  @ApiOperation({ summary: 'Remove a permission from a role' })
  @ApiResponse({ status: 200, description: 'Permission removed successfully', type: RoleResponseDto })
  @ApiResponse({ status: 400, description: 'Cannot modify system role' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async removePermission(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('permission') permission: string,
  ): Promise<RoleResponseDto> {
    const role = await this.roleService.removePermission(id, permission);
    return new RoleResponseDto(role);
  }
}