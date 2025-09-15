import { Repository, DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private readonly dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findAll(): Promise<User[]> {
    return this.find();
  }

  async findById(id: number): Promise<User | null> {
    return this.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.findOne({ where: { username } });
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const user = this.create(userData);
    return this.save(user);
  }

  async updateUser(id: number, updateData: Partial<User>): Promise<User | null> {
    await this.update(id, updateData);
    return this.findById(id);
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await this.delete(id);
    return result.affected > 0;
  }

  async exists(id: number): Promise<boolean> {
    const count = await this.count({ where: { id } });
    return count > 0;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.count({ where: { email } });
    return count > 0;
  }

  async existsByUsername(username: string): Promise<boolean> {
    const count = await this.count({ where: { username } });
    return count > 0;
  }
}