import { Controller, Get, Query, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { ProjectHistoryService } from './project-history.service';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../database/entities/user.entity';

@ApiTags('Project History')
@Controller('project-history')
export class ProjectHistoryController {
  constructor(private readonly projectHistoryService: ProjectHistoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get user project history with pagination and search' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 20)' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by project name' })
  @ApiResponse({ status: 200, description: 'Project history retrieved successfully' })
  async getProjectHistory(
    @GetUser() user: User,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.projectHistoryService.getUserProjectHistory({
      userId: user.id,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      search,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get user project statistics' })
  @ApiResponse({ status: 200, description: 'Project statistics retrieved successfully' })
  async getProjectStats(@GetUser() user: User) {
    return this.projectHistoryService.getProjectStats(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get specific project details' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiResponse({ status: 200, description: 'Project details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async getProjectById(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.projectHistoryService.getProjectById(id, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project from history' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiResponse({ status: 200, description: 'Project deleted successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async deleteProject(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.projectHistoryService.deleteProject(id, user.id);
  }
}