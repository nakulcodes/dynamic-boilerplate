import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { GitHubService } from '../github/github.service';

export interface GitHubProfile {
  id: string;
  username: string;
  displayName: string;
  emails: Array<{ value: string; primary?: boolean; verified?: boolean }>;
  photos: Array<{ value: string }>;
  profileUrl: string;
  _raw: string;
  _json: any;
}

export interface GitHubUser {
  githubId: string;
  username: string;
  displayName: string;
  email: string;
  avatarUrl: string;
  accessToken: string;
  refreshToken?: string;
}

@Injectable()
export class GitHubOAuthStrategy extends PassportStrategy(Strategy, 'github') {
  private readonly logger = new Logger(GitHubOAuthStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly githubService: GitHubService,
  ) {
    super({
      clientID: configService.get<string>('GITHUB_CLIENT_ID'),
      clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GITHUB_CALLBACK_URL'),
      scope: ['user:email', 'repo', 'public_repo'],
      passReqToCallback: true,
    });
  }

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: GitHubProfile,
    done: any,
  ): Promise<any> {
    try {
      this.logger.log(`GitHub OAuth validation for user: ${profile.username}`);

      const email = profile.emails?.find(email => email.primary)?.value ||
                   profile.emails?.[0]?.value ||
                   `${profile.username}@users.noreply.github.com`;

      const user: GitHubUser = {
        githubId: profile.id,
        username: profile.username,
        displayName: profile.displayName || profile.username,
        email,
        avatarUrl: profile.photos?.[0]?.value || '',
        accessToken,
        refreshToken,
      };

      // Extract userId from state parameter if available
      const state = req.query.state;
      let userId: string | null = null;

      if (state) {
        try {
          const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
          userId = stateData.userId;
        } catch (error) {
          this.logger.warn('Failed to parse state parameter:', error);
        }
      }

      // Store the user data and token if userId is available
      if (userId) {
        await this.githubService.storeUserToken(userId, {
          accessToken,
          refreshToken,
          username: user.username,
          email: user.email,
          scopes: ['user:email', 'repo', 'public_repo'],
        });

        this.logger.log(`Stored GitHub token for user: ${userId}`);
      }

      return { user, userId, state };
    } catch (error) {
      this.logger.error('GitHub OAuth validation failed:', error);
      return done(error, null);
    }
  }
}