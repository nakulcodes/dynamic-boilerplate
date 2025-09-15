import { Repository, DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { GitHubToken } from '../entities/github-token.entity';

@Injectable()
export class GitHubTokenRepository extends Repository<GitHubToken> {
  constructor(private readonly dataSource: DataSource) {
    super(GitHubToken, dataSource.createEntityManager());
  }

  async findAll(): Promise<GitHubToken[]> {
    return this.find({ where: { isActive: true } });
  }

  async findById(id: string): Promise<GitHubToken | null> {
    return this.findOne({ where: { id, isActive: true } });
  }

  async findByUserId(userId: string): Promise<GitHubToken | null> {
    return this.findOne({ where: { userId, isActive: true } });
  }

  async findByUsername(username: string): Promise<GitHubToken | null> {
    return this.findOne({ where: { username, isActive: true } });
  }

  async createGitHubToken(tokenData: Partial<GitHubToken>): Promise<GitHubToken> {
    const token = this.create(tokenData);
    return this.save(token);
  }

  async updateGitHubToken(id: string, updateData: Partial<GitHubToken>): Promise<GitHubToken | null> {
    const token = await this.findById(id);
    if (!token) return null;

    Object.assign(token, updateData);
    return this.save(token);
  }

  async deleteGitHubToken(id: string): Promise<boolean> {
    const result = await this.update(id, { isActive: false });
    return result.affected > 0;
  }

  async existsById(id: string): Promise<boolean> {
    const count = await this.count({ where: { id, isActive: true } });
    return count > 0;
  }

  async existsByUserId(userId: string): Promise<boolean> {
    const count = await this.count({ where: { userId, isActive: true } });
    return count > 0;
  }

  async findActiveTokensByUserId(userId: string): Promise<GitHubToken[]> {
    return this.find({
      where: { userId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findValidToken(userId: string): Promise<GitHubToken | null> {
    return this.findOne({
      where: {
        userId,
        isActive: true
      },
      order: { updatedAt: 'DESC' },
    });
  }
}