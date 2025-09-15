import { Repository, DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Role } from '../entities/role.entity';

@Injectable()
export class RoleRepository extends Repository<Role> {
  constructor(private readonly dataSource: DataSource) {
    super(Role, dataSource.createEntityManager());
  }

  async findAll(): Promise<Role[]> {
    return this.find({
      where: { deletedAt: null },
      order: { priority: 'DESC', createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Role | null> {
    return this.findOne({
      where: { id, deletedAt: null },
      relations: ['users'],
    });
  }

  async findByName(name: string): Promise<Role | null> {
    return this.findOne({
      where: { name, deletedAt: null },
    });
  }

  async findWithPagination(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ items: Role[]; total: number }> {
    const skip = (page - 1) * limit;

    const [roles, total] = await this.findAndCount({
      skip,
      take: limit,
      order: { priority: 'DESC', createdAt: 'DESC' },
      where: { deletedAt: null },
    });

    return { items: roles, total };
  }

  async findSystemRoles(): Promise<Role[]> {
    return this.find({
      where: { isSystem: true, deletedAt: null },
      order: { priority: 'DESC' },
    });
  }

  async createRole(roleData: Partial<Role>): Promise<Role> {
    const role = this.create({ ...roleData, isSystem: false });
    return this.save(role);
  }

  async updateRole(id: string, updateData: Partial<Role>): Promise<Role | null> {
    await this.update(id, updateData);
    return this.findById(id);
  }

  async softDeleteRole(id: string): Promise<boolean> {
    const result = await this.update(id, { deletedAt: new Date() });
    return result.affected > 0;
  }

  async existsByName(name: string): Promise<boolean> {
    const count = await this.count({
      where: { name, deletedAt: null },
    });
    return count > 0;
  }

  async existsById(id: string): Promise<boolean> {
    const count = await this.count({
      where: { id, deletedAt: null },
    });
    return count > 0;
  }

  async isSystemRole(id: string): Promise<boolean> {
    const count = await this.count({
      where: { id, isSystem: true, deletedAt: null },
    });
    return count > 0;
  }

  async getUsersCount(roleId: string): Promise<number> {
    const role = await this.findOne({
      where: { id: roleId, deletedAt: null },
      relations: ['users'],
    });
    return role?.users?.length || 0;
  }
}