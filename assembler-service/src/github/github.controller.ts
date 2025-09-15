import { Controller, Get, Post, Body, Param, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { GitHubService, CreateRepositoryDto, PushToRepoDto } from './github.service';

@ApiTags('GitHub Integration')
@Controller('github')
export class GitHubController {
  constructor(
    private readonly githubService: GitHubService,
    private readonly configService: ConfigService,
  ) {}

  @Post('token')
  @ApiOperation({ summary: 'Store GitHub access token for a user' })
  @ApiResponse({ status: 201, description: 'Token stored successfully' })
  @ApiResponse({ status: 400, description: 'Invalid token data' })
  async storeToken(@Body() tokenData: {
    userId: string;
    accessToken: string;
    refreshToken?: string;
    username?: string;
    email?: string;
    scopes?: string[];
    expiresAt?: string;
  }) {
    const expiresAt = tokenData.expiresAt ? new Date(tokenData.expiresAt) : undefined;

    const token = await this.githubService.storeUserToken(tokenData.userId, {
      ...tokenData,
      expiresAt,
    });

    return {
      success: true,
      tokenId: token.id,
    };
  }

  @Get('repositories/:userId')
  @ApiOperation({ summary: 'Get user repositories from GitHub' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiQuery({ name: 'type', required: false, enum: ['all', 'owner', 'public', 'private'], description: 'Repository type' })
  @ApiResponse({ status: 200, description: 'Repositories retrieved successfully' })
  @ApiResponse({ status: 401, description: 'GitHub token not found or invalid' })
  async getUserRepositories(
    @Param('userId') userId: string,
    @Query('type') type: 'all' | 'owner' | 'public' | 'private' = 'owner'
  ) {
    const repositories = await this.githubService.getUserRepositories(userId, type);
    return {
      success: true,
      repositories,
    };
  }

  @Post('repositories')
  @ApiOperation({ summary: 'Create a new GitHub repository' })
  @ApiResponse({ status: 201, description: 'Repository created successfully' })
  @ApiResponse({ status: 400, description: 'Failed to create repository' })
  @ApiResponse({ status: 401, description: 'GitHub token not found or invalid' })
  async createRepository(@Body() createRepoData: {
    userId: string;
    name: string;
    description?: string;
    private?: boolean;
    autoInit?: boolean;
  }) {
    if (!createRepoData.userId || !createRepoData.name) {
      throw new BadRequestException('userId and name are required');
    }

    const repository = await this.githubService.createRepository(createRepoData.userId, {
      name: createRepoData.name,
      description: createRepoData.description,
      private: createRepoData.private,
      autoInit: createRepoData.autoInit,
    });

    return {
      success: true,
      repository,
    };
  }

  @Post('push')
  @ApiOperation({ summary: 'Push generated project to GitHub repository' })
  @ApiResponse({ status: 200, description: 'Project pushed successfully' })
  @ApiResponse({ status: 400, description: 'Failed to push to repository' })
  @ApiResponse({ status: 401, description: 'GitHub token not found or invalid' })
  async pushToRepository(@Body() pushData: PushToRepoDto) {
    if (!pushData.userId || !pushData.repositoryName || !pushData.projectPath) {
      throw new BadRequestException('userId, repositoryName, and projectPath are required');
    }

    const result = await this.githubService.pushProjectToRepository(pushData);
    return {
      success: result.success,
      repositoryUrl: result.repositoryUrl,
    };
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get GitHub user information' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User information retrieved successfully' })
  @ApiResponse({ status: 401, description: 'GitHub token not found or invalid' })
  async getUserInfo(@Param('userId') userId: string) {
    const userInfo = await this.githubService.getUserInfo(userId);
    return {
      success: true,
      user: userInfo,
    };
  }

  @Post('validate/:userId')
  @ApiOperation({ summary: 'Validate GitHub token for a user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Token validation result' })
  async validateToken(@Param('userId') userId: string) {
    const isValid = await this.githubService.validateToken(userId);
    return {
      success: true,
      valid: isValid,
    };
  }

  @Post('revoke/:userId')
  @ApiOperation({ summary: 'Revoke GitHub token for a user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Token revoked successfully' })
  async revokeToken(@Param('userId') userId: string) {
    const revoked = await this.githubService.revokeToken(userId);
    return {
      success: true,
      revoked,
    };
  }

  // Frontend Integration Endpoints

  @Get('auth-url/:userId')
  @ApiOperation({ summary: 'Get GitHub OAuth URL for frontend integration' })
  @ApiParam({ name: 'userId', description: 'User ID to associate with GitHub account' })
  @ApiQuery({ name: 'redirect', required: false, description: 'Frontend redirect URL after OAuth' })
  @ApiResponse({ status: 200, description: 'OAuth URL generated successfully' })
  async getAuthUrl(
    @Param('userId') userId: string,
    @Query('redirect') redirectUrl?: string,
  ) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    const baseUrl = this.configService.get<string>('NODE_ENV') === 'production'
      ? this.configService.get<string>('APP_URL', 'http://localhost:5001')
      : 'http://localhost:5001';

    const authUrl = new URL('/auth/github', baseUrl);
    authUrl.searchParams.set('userId', userId);

    if (redirectUrl) {
      authUrl.searchParams.set('redirect', redirectUrl);
    }

    return {
      success: true,
      authUrl: authUrl.toString(),
      userId,
    };
  }

  @Get('status/:userId')
  @ApiOperation({ summary: 'Check if user has connected GitHub account' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'GitHub connection status retrieved' })
  async getConnectionStatus(@Param('userId') userId: string) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    try {
      const userInfo = await this.githubService.getUserInfo(userId);
      const isValid = await this.githubService.validateToken(userId);

      return {
        success: true,
        connected: isValid,
        user: isValid ? {
          username: userInfo.username,
          email: userInfo.email,
          name: userInfo.name,
        } : null,
      };
    } catch (error) {
      return {
        success: true,
        connected: false,
        user: null,
      };
    }
  }

  @Post('disconnect/:userId')
  @ApiOperation({ summary: 'Disconnect GitHub account for a user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'GitHub account disconnected successfully' })
  async disconnectAccount(@Param('userId') userId: string) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    const revoked = await this.githubService.revokeToken(userId);

    return {
      success: true,
      disconnected: revoked,
      message: revoked ? 'GitHub account disconnected successfully' : 'No GitHub account was connected',
    };
  }
}