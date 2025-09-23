import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { GeneratedProjectRepository, ProjectHistoryQueryDto } from '../database/repositories/generated-project.repository';

@Injectable()
export class ProjectHistoryService {
  constructor(
    private readonly generatedProjectRepository: GeneratedProjectRepository,
  ) {}

  async getUserProjectHistory(query: ProjectHistoryQueryDto) {
    const result = await this.generatedProjectRepository.findUserProjectHistory(query);

    return {
      success: true,
      data: {
        projects: result.projects.map(project => ({
          id: project.id,
          projectName: project.projectName,
          preset: project.preset,
          modules: project.modules,
          author: project.author,
          status: project.status,
          downloadUrl: project.downloadUrl,
          fileName: project.fileName,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
        })),
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / result.limit),
        },
      },
    };
  }

  async getProjectStats(userId: number) {
    const stats = await this.generatedProjectRepository.getProjectStats(userId);

    return {
      success: true,
      data: {
        totalProjects: stats.totalProjects,
        completedProjects: stats.completedProjects,
        failedProjects: stats.failedProjects,
        recentProjects: stats.recentProjects.map(project => ({
          id: project.id,
          projectName: project.projectName,
          preset: project.preset,
          status: project.status,
          createdAt: project.createdAt,
        })),
      },
    };
  }

  async getProjectById(id: number, userId: number) {
    const project = await this.generatedProjectRepository.findProjectById(id);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Ensure the project belongs to the requesting user
    if (project.userId !== userId) {
      throw new ForbiddenException('Access denied to this project');
    }

    return {
      success: true,
      data: {
        id: project.id,
        projectName: project.projectName,
        preset: project.preset,
        modules: project.modules,
        author: project.author,
        status: project.status,
        downloadUrl: project.downloadUrl,
        fileName: project.fileName,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        user: {
          id: project.user.id,
          email: project.user.email,
          firstName: project.user.firstName,
          lastName: project.user.lastName,
        },
      },
    };
  }

  async deleteProject(id: number, userId: number) {
    const project = await this.generatedProjectRepository.findProjectById(id);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Ensure the project belongs to the requesting user
    if (project.userId !== userId) {
      throw new ForbiddenException('Access denied to this project');
    }

    const deleted = await this.generatedProjectRepository.deleteProject(id, userId);

    if (!deleted) {
      throw new NotFoundException('Project not found or could not be deleted');
    }

    return {
      success: true,
      message: 'Project deleted successfully',
    };
  }
}