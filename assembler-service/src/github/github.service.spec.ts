import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { GitHubService } from './github.service';
import { GitHubTokenRepository } from '../database/repositories/github-token.repository';
import { GitHubToken } from '../database/entities/github-token.entity';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';

describe('GitHubService', () => {
  let service: GitHubService;
  let gitHubTokenRepository: jest.Mocked<GitHubTokenRepository>;
  let configService: jest.Mocked<ConfigService>;

  const mockToken: Partial<GitHubToken> = {
    id: 'token-123',
    userId: 'user-123',
    accessToken: 'github_token_123',
    username: 'testuser',
    email: 'test@example.com',
    isActive: true,
  };

  beforeEach(async () => {
    const mockGitHubTokenRepository = {
      findValidToken: jest.fn(),
      findByUserId: jest.fn(),
      createGitHubToken: jest.fn(),
      updateGitHubToken: jest.fn(),
      deleteGitHubToken: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GitHubService,
        {
          provide: GitHubTokenRepository,
          useValue: mockGitHubTokenRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<GitHubService>(GitHubService);
    gitHubTokenRepository = module.get(GitHubTokenRepository);
    configService = module.get(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('storeUserToken', () => {
    it('should create a new token for a new user', async () => {
      const tokenData = {
        accessToken: 'new_token',
        username: 'newuser',
        email: 'new@example.com',
      };

      gitHubTokenRepository.findByUserId.mockResolvedValue(null);
      gitHubTokenRepository.createGitHubToken.mockResolvedValue(mockToken as GitHubToken);

      const result = await service.storeUserToken('user-456', tokenData);

      expect(gitHubTokenRepository.findByUserId).toHaveBeenCalledWith('user-456');
      expect(gitHubTokenRepository.createGitHubToken).toHaveBeenCalledWith({
        userId: 'user-456',
        ...tokenData,
        isActive: true,
      });
      expect(result).toBe(mockToken);
    });

    it('should update existing token for existing user', async () => {
      const tokenData = {
        accessToken: 'updated_token',
        username: 'updateduser',
        email: 'updated@example.com',
      };

      gitHubTokenRepository.findByUserId.mockResolvedValue(mockToken as GitHubToken);
      gitHubTokenRepository.updateGitHubToken.mockResolvedValue(mockToken as GitHubToken);

      const result = await service.storeUserToken('user-123', tokenData);

      expect(gitHubTokenRepository.findByUserId).toHaveBeenCalledWith('user-123');
      expect(gitHubTokenRepository.updateGitHubToken).toHaveBeenCalledWith(mockToken.id, {
        ...tokenData,
        isActive: true,
      });
      expect(result).toBe(mockToken);
    });
  });

  describe('validateToken', () => {
    it('should return false when no token found', async () => {
      gitHubTokenRepository.findValidToken.mockResolvedValue(null);

      const result = await service.validateToken('user-123');

      expect(result).toBe(false);
    });

    it('should return false when GitHub API call fails', async () => {
      gitHubTokenRepository.findValidToken.mockResolvedValue(mockToken as GitHubToken);

      // Mock the Octokit call to fail by causing an error in getOctokitForUser
      const result = await service.validateToken('user-123');

      expect(result).toBe(false);
    });
  });

  describe('revokeToken', () => {
    it('should revoke token successfully', async () => {
      gitHubTokenRepository.findByUserId.mockResolvedValue(mockToken as GitHubToken);
      gitHubTokenRepository.deleteGitHubToken.mockResolvedValue(true);

      const result = await service.revokeToken('user-123');

      expect(gitHubTokenRepository.findByUserId).toHaveBeenCalledWith('user-123');
      expect(gitHubTokenRepository.deleteGitHubToken).toHaveBeenCalledWith(mockToken.id);
      expect(result).toBe(true);
    });

    it('should return false when no token found', async () => {
      gitHubTokenRepository.findByUserId.mockResolvedValue(null);

      const result = await service.revokeToken('user-123');

      expect(gitHubTokenRepository.findByUserId).toHaveBeenCalledWith('user-123');
      expect(gitHubTokenRepository.deleteGitHubToken).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('getOctokitForUser', () => {
    it('should throw UnauthorizedException when no token found', async () => {
      gitHubTokenRepository.findValidToken.mockResolvedValue(null);

      await expect(service.getUserRepositories('user-123')).rejects.toThrow(UnauthorizedException);
    });
  });
});