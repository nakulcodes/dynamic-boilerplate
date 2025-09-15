import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Role } from '../../database/entities/role.entity';
import { RoleRepository } from '../../database/repositories/role.repository';
import { CreateRoleDto } from './dto/request/create-role.dto';
import { UpdateRoleDto } from './dto/request/update-role.dto';
import { isValidPermission, getAllPermissions } from '../../common/rbac/permissions';

@Injectable()
export class RoleService {
  constructor(
    private readonly roleRepository: RoleRepository,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const { name, permissions } = createRoleDto;

    // Check if role already exists
    const existingRole = await this.roleRepository.findByName(name);
    if (existingRole) {
      throw new ConflictException(`Role with name '${name}' already exists`);
    }

    // Validate permissions
    const invalidPermissions = permissions.filter(p => !isValidPermission(p));
    if (invalidPermissions.length > 0) {
      throw new BadRequestException(
        `Invalid permissions: ${invalidPermissions.join(', ')}`,
      );
    }

    // Create role
    return this.roleRepository.createRole(createRoleDto);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ items: Role[]; total: number; page: number; totalPages: number }> {
    const { items, total } = await this.roleRepository.findWithPagination(page, limit);

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.roleRepository.findById(id);

    if (!role) {
      throw new NotFoundException(`Role with ID '${id}' not found`);
    }

    return role;
  }

  async findByName(name: string): Promise<Role | null> {
    return this.roleRepository.findByName(name);
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);

    // Prevent editing system roles
    if (role.isSystem) {
      throw new BadRequestException('Cannot modify system roles');
    }

    const { name, permissions } = updateRoleDto;

    // Check name uniqueness if changing
    if (name && name !== role.name) {
      const existingRole = await this.findByName(name);
      if (existingRole) {
        throw new ConflictException(`Role name '${name}' is already in use`);
      }
    }

    // Validate permissions if provided
    if (permissions) {
      const invalidPermissions = permissions.filter(p => !isValidPermission(p));
      if (invalidPermissions.length > 0) {
        throw new BadRequestException(
          `Invalid permissions: ${invalidPermissions.join(', ')}`,
        );
      }
    }

    // Update role
    const updatedRole = await this.roleRepository.updateRole(id, updateRoleDto);
    if (!updatedRole) {
      throw new NotFoundException(`Role with ID '${id}' not found`);
    }

    return updatedRole;
  }

  async remove(id: string): Promise<{ message: string }> {
    const role = await this.findOne(id);

    // Prevent deleting system roles
    if (role.isSystem) {
      throw new BadRequestException('Cannot delete system roles');
    }

    // Check if role is in use
    const usersCount = await this.roleRepository.getUsersCount(id);
    if (usersCount > 0) {
      throw new BadRequestException(
        `Cannot delete role that is assigned to ${usersCount} user(s)`,
      );
    }

    // Soft delete
    const deleted = await this.roleRepository.softDeleteRole(id);
    if (!deleted) {
      throw new NotFoundException(`Role with ID '${id}' not found`);
    }

    return { message: 'Role deleted successfully' };
  }

  async getPermissions(): Promise<string[]> {
    return getAllPermissions();
  }

  async getSystemRoles(): Promise<Role[]> {
    return this.roleRepository.findSystemRoles();
  }

  async assignPermissions(roleId: string, permissions: string[]): Promise<Role> {
    const role = await this.findOne(roleId);

    if (role.isSystem) {
      throw new BadRequestException('Cannot modify permissions for system roles');
    }

    // Validate permissions
    const invalidPermissions = permissions.filter(p => !isValidPermission(p));
    if (invalidPermissions.length > 0) {
      throw new BadRequestException(
        `Invalid permissions: ${invalidPermissions.join(', ')}`,
      );
    }

    const updatedRole = await this.roleRepository.updateRole(roleId, { permissions });
    if (!updatedRole) {
      throw new NotFoundException(`Role with ID '${roleId}' not found`);
    }

    return updatedRole;
  }

  async addPermission(roleId: string, permission: string): Promise<Role> {
    const role = await this.findOne(roleId);

    if (role.isSystem) {
      throw new BadRequestException('Cannot modify permissions for system roles');
    }

    if (!isValidPermission(permission)) {
      throw new BadRequestException(`Invalid permission: ${permission}`);
    }

    if (!role.permissions.includes(permission)) {
      const updatedPermissions = [...role.permissions, permission];
      const updatedRole = await this.roleRepository.updateRole(roleId, { permissions: updatedPermissions });
      if (!updatedRole) {
        throw new NotFoundException(`Role with ID '${roleId}' not found`);
      }
      return updatedRole;
    }

    return role;
  }

  async removePermission(roleId: string, permission: string): Promise<Role> {
    const role = await this.findOne(roleId);

    if (role.isSystem) {
      throw new BadRequestException('Cannot modify permissions for system roles');
    }

    const updatedPermissions = role.permissions.filter(p => p !== permission);
    const updatedRole = await this.roleRepository.updateRole(roleId, { permissions: updatedPermissions });
    if (!updatedRole) {
      throw new NotFoundException(`Role with ID '${roleId}' not found`);
    }

    return updatedRole;
  }
}