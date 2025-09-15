import { Injectable, Logger, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Octokit } from '@octokit/rest';
import * as fs from 'fs-extra';
import * as path from 'path';
import simpleGit, { SimpleGit } from 'simple-git';
import { GitHubTokenRepository } from '../database/repositories/github-token.repository';
import { GitHubToken } from '../database/entities/github-token.entity';

export interface GitHubRepository {
  name: string;
  description?: string;
  private?: boolean;
  clone_url: string;
  html_url: string;
}

export interface CreateRepositoryDto {
  name: string;
  description?: string;
  private?: boolean;
  autoInit?: boolean;
}

export interface PushToRepoDto {
  userId: string;
  repositoryName: string;
  projectPath: string;
  commitMessage?: string;
  branch?: string;
}

@Injectable()
export class GitHubService {
  private readonly logger = new Logger(GitHubService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly gitHubTokenRepository: GitHubTokenRepository,
  ) {}

  private async getOctokitForUser(userId: string): Promise<Octokit> {
    const token = await this.gitHubTokenRepository.findValidToken(userId);
    if (!token) {
      throw new UnauthorizedException('GitHub token not found for user');
    }

    return new Octokit({
      auth: token.accessToken,
    });
  }

  async storeUserToken(userId: string, tokenData: {
    accessToken: string;
    refreshToken?: string;
    username?: string;
    email?: string;
    scopes?: string[];
    expiresAt?: Date;
  }): Promise<GitHubToken> {
    // Check if user already has a token
    const existingToken = await this.gitHubTokenRepository.findByUserId(userId);

    if (existingToken) {
      // Update existing token
      return this.gitHubTokenRepository.updateGitHubToken(existingToken.id, {
        ...tokenData,
        isActive: true,
      });
    } else {
      // Create new token
      return this.gitHubTokenRepository.createGitHubToken({
        userId,
        ...tokenData,
        isActive: true,
      });
    }
  }

  async getUserRepositories(userId: string, type: 'all' | 'owner' | 'public' | 'private' = 'owner'): Promise<GitHubRepository[]> {
    const octokit = await this.getOctokitForUser(userId);

    try {
      const { data } = await octokit.rest.repos.listForAuthenticatedUser({
        type,
        sort: 'updated',
        per_page: 100,
      });

      return data.map(repo => ({
        name: repo.name,
        description: repo.description,
        private: repo.private,
        clone_url: repo.clone_url,
        html_url: repo.html_url,
      }));
    } catch (error) {
      this.logger.error(`Failed to fetch repositories for user ${userId}:`, error);
      throw new BadRequestException('Failed to fetch repositories from GitHub');
    }
  }

  async createRepository(userId: string, createRepoDto: CreateRepositoryDto): Promise<GitHubRepository> {
    const octokit = await this.getOctokitForUser(userId);

    try {
      const { data } = await octokit.rest.repos.createForAuthenticatedUser({
        name: createRepoDto.name,
        description: createRepoDto.description,
        private: createRepoDto.private || false,
        auto_init: createRepoDto.autoInit || true,
      });

      this.logger.log(`Created repository: ${data.name} for user ${userId}`);

      return {
        name: data.name,
        description: data.description,
        private: data.private,
        clone_url: data.clone_url,
        html_url: data.html_url,
      };
    } catch (error) {
      this.logger.error(`Failed to create repository for user ${userId}:`, error);

      if (error.status === 422) {
        throw new BadRequestException('Repository name already exists or is invalid');
      }

      throw new BadRequestException('Failed to create repository on GitHub');
    }
  }

  async pushProjectToRepository(pushDto: PushToRepoDto): Promise<{ success: boolean; repositoryUrl: string }> {
    const { userId, repositoryName, projectPath, commitMessage = 'Initial commit', branch = 'main' } = pushDto;

    try {
      // Get user's GitHub token
      const token = await this.gitHubTokenRepository.findValidToken(userId);
      if (!token) {
        throw new UnauthorizedException('GitHub token not found for user');
      }

      const octokit = await this.getOctokitForUser(userId);

      // Get user info to construct repository URL
      const { data: user } = await octokit.rest.users.getAuthenticated();
      const repositoryUrl = `https://github.com/${user.login}/${repositoryName}`;
      const cloneUrl = `https://${token.accessToken}@github.com/${user.login}/${repositoryName}.git`;

      // Initialize git in the project directory
      const git: SimpleGit = simpleGit(projectPath);

      // Check if git is already initialized
      const isRepo = await fs.pathExists(path.join(projectPath, '.git'));
      if (!isRepo) {
        await git.init();
        this.logger.log(`Initialized git repository in ${projectPath}`);
      }

      // Add all files
      await git.add('.');
      this.logger.log('Added all files to git');

      // Create initial commit
      try {
        await git.commit(commitMessage);
        this.logger.log(`Created commit: ${commitMessage}`);
      } catch (error) {
        // If commit fails because there are no changes, that's okay
        if (!error.message.includes('nothing to commit')) {
          throw error;
        }
        this.logger.log('No changes to commit');
      }

      // Add remote origin
      try {
        await git.addRemote('origin', cloneUrl);
      } catch (error) {
        // If remote already exists, update it
        if (error.message.includes('remote origin already exists')) {
          await git.removeRemote('origin');
          await git.addRemote('origin', cloneUrl);
        } else {
          throw error;
        }
      }

      // Set the default branch name
      await git.branch(['-M', branch]);

      // Push to remote repository
      await git.push(['-u', 'origin', branch]);
      this.logger.log(`Pushed to repository: ${repositoryUrl}`);

      return {
        success: true,
        repositoryUrl,
      };

    } catch (error) {
      this.logger.error(`Failed to push project to repository:`, error);

      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new BadRequestException(`Failed to push to GitHub repository: ${error.message}`);
    }
  }

  async getUserInfo(userId: string): Promise<{ username: string; email: string; name: string }> {
    const octokit = await this.getOctokitForUser(userId);

    try {
      const { data } = await octokit.rest.users.getAuthenticated();
      return {
        username: data.login,
        email: data.email,
        name: data.name,
      };
    } catch (error) {
      this.logger.error(`Failed to get user info for ${userId}:`, error);
      throw new BadRequestException('Failed to get user information from GitHub');
    }
  }

  async validateToken(userId: string): Promise<boolean> {
    try {
      const octokit = await this.getOctokitForUser(userId);
      await octokit.rest.users.getAuthenticated();
      return true;
    } catch (error) {
      this.logger.warn(`Token validation failed for user ${userId}:`, error);
      return false;
    }
  }

  async revokeToken(userId: string): Promise<boolean> {
    const token = await this.gitHubTokenRepository.findByUserId(userId);
    if (!token) {
      return false;
    }

    return this.gitHubTokenRepository.deleteGitHubToken(token.id);
  }
}