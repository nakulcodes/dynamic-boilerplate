import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { isValidPermission, getAllPermissions } from '@common/rbac/permissions';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const { name, permissions } = createRoleDto;

    // Check if role already exists
    const existingRole = await this.roleRepository.findOne({ where: { name } });
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
    const role = this.roleRepository.create({
      ...createRoleDto,
      isSystem: false,
    });

    return this.roleRepository.save(role);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ items: Role[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;

    const [roles, total] = await this.roleRepository.findAndCount({
      skip,
      take: limit,
      order: { priority: 'DESC', createdAt: 'DESC' },
      where: { deletedAt: null },
    });

    return {
      items: roles,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id, deletedAt: null },
      relations: ['users'],
    });

    if (!role) {
      throw new NotFoundException(`Role with ID '${id}' not found`);
    }

    return role;
  }

  async findByName(name: string): Promise<Role | null> {
    return this.roleRepository.findOne({
      where: { name, deletedAt: null },
    });
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
    Object.assign(role, updateRoleDto);
    return this.roleRepository.save(role);
  }

  async remove(id: string): Promise<{ message: string }> {
    const role = await this.findOne(id);

    // Prevent deleting system roles
    if (role.isSystem) {
      throw new BadRequestException('Cannot delete system roles');
    }

    // Check if role is in use
    const usersCount = role.users?.length || 0;
    if (usersCount > 0) {
      throw new BadRequestException(
        `Cannot delete role that is assigned to ${usersCount} user(s)`,
      );
    }

    // Soft delete
    role.deletedAt = new Date();
    await this.roleRepository.save(role);

    return { message: 'Role deleted successfully' };
  }

  async getPermissions(): Promise<string[]> {
    return getAllPermissions();
  }

  async getSystemRoles(): Promise<Role[]> {
    return this.roleRepository.find({
      where: { isSystem: true, deletedAt: null },
      order: { priority: 'DESC' },
    });
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

    role.permissions = permissions;
    return this.roleRepository.save(role);
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
      role.permissions.push(permission);
      await this.roleRepository.save(role);
    }

    return role;
  }

  async removePermission(roleId: string, permission: string): Promise<Role> {
    const role = await this.findOne(roleId);

    if (role.isSystem) {
      throw new BadRequestException('Cannot modify permissions for system roles');
    }

    role.permissions = role.permissions.filter(p => p !== permission);
    return this.roleRepository.save(role);
  }
}