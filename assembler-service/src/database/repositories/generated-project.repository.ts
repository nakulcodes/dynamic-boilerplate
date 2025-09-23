import { Injectable } from '@nestjs/common';
import { Repository, DataSource, FindManyOptions, FindOneOptions } from 'typeorm';
import { GeneratedProject } from '../entities/generated-project.entity';

export interface CreateGeneratedProjectDto {
  projectName: string;
  preset: string;
  modules: string[];
  author: string;
  userId: number;
  downloadUrl?: string;
  fileName?: string;
  status?: string;
}

export interface UpdateGeneratedProjectDto {
  downloadUrl?: string;
  fileName?: string;
  status?: string;
}

export interface ProjectHistoryQueryDto {
  userId: number;
  page?: number;
  limit?: number;
  search?: string;
}

@Injectable()
export class GeneratedProjectRepository extends Repository<GeneratedProject> {
  constructor(private readonly dataSource: DataSource) {
    super(GeneratedProject, dataSource.createEntityManager());
  }

  async createProject(projectData: CreateGeneratedProjectDto): Promise<GeneratedProject> {
    const project = this.create({
      ...projectData,
      status: projectData.status || 'generating'
    });
    return this.save(project);
  }

  async updateProject(id: number, updateData: UpdateGeneratedProjectDto): Promise<GeneratedProject | null> {
    await this.update(id, updateData);
    return this.findOne({ where: { id } });
  }

  async findByUser(userId: number, options?: FindManyOptions<GeneratedProject>): Promise<GeneratedProject[]> {
    return this.find({
      where: { userId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      ...options
    });
  }

  async findUserProjectHistory(query: ProjectHistoryQueryDto): Promise<{
    projects: GeneratedProject[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { userId, page = 1, limit = 20, search } = query;

    const queryBuilder = this.createQueryBuilder('project')
      .leftJoinAndSelect('project.user', 'user')
      .where('project.userId = :userId', { userId })
      .orderBy('project.createdAt', 'DESC');

    if (search) {
      queryBuilder.andWhere('project.projectName ILIKE :search', {
        search: `%${search}%`
      });
    }

    const total = await queryBuilder.getCount();

    const projects = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      projects,
      total,
      page,
      limit
    };
  }

  async findProjectById(id: number, relations: string[] = ['user']): Promise<GeneratedProject | null> {
    return this.findOne({
      where: { id },
      relations
    });
  }

  async getProjectStats(userId: number): Promise<{
    totalProjects: number;
    completedProjects: number;
    failedProjects: number;
    recentProjects: GeneratedProject[];
  }> {
    const totalProjects = await this.count({ where: { userId } });
    const completedProjects = await this.count({ where: { userId, status: 'completed' } });
    const failedProjects = await this.count({ where: { userId, status: 'failed' } });

    const recentProjects = await this.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 5,
      relations: ['user']
    });

    return {
      totalProjects,
      completedProjects,
      failedProjects,
      recentProjects
    };
  }

  async deleteProject(id: number, userId: number): Promise<boolean> {
    const result = await this.delete({ id, userId });
    return result.affected > 0;
  }
}