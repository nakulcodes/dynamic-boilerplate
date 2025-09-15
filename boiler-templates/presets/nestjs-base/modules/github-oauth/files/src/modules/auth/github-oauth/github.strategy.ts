import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-github2';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GitHubOAuthService } from './github-oauth.service';

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private githubOAuthService: GitHubOAuthService,
    private configService: ConfigService,
  ) {
    super({
      clientID: configService.get<string>('GITHUB_CLIENT_ID'),
      clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GITHUB_CALLBACK_URL'),
      scope: ['user:email', 'read:user'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { username, displayName, emails, photos } = profile;

    const githubUser = {
      email: emails && emails[0] ? emails[0].value : null,
      username: username,
      firstName: displayName ? displayName.split(' ')[0] : username,
      lastName: displayName ? displayName.split(' ').slice(1).join(' ') : '',
      picture: photos && photos[0] ? photos[0].value : null,
      accessToken,
      provider: 'github',
    };

    const user = await this.githubOAuthService.validateOAuthUser(githubUser);
    done(null, user);
  }
}