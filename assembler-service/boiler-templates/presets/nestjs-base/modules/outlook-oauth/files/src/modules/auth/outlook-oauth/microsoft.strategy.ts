import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-microsoft';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OutlookOAuthService } from './outlook-oauth.service';

@Injectable()
export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
  constructor(
    private outlookOAuthService: OutlookOAuthService,
    private configService: ConfigService,
  ) {
    super({
      clientID: configService.get<string>('MICROSOFT_CLIENT_ID'),
      clientSecret: configService.get<string>('MICROSOFT_CLIENT_SECRET'),
      callbackURL: configService.get<string>('MICROSOFT_CALLBACK_URL'),
      scope: ['user.read'],
      tenant: 'common', // Allows both personal and work/school accounts
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { displayName, emails, photos } = profile;

    const microsoftUser = {
      email: emails && emails[0] ? emails[0].value : null,
      firstName: profile.name?.givenName || displayName?.split(' ')[0] || '',
      lastName: profile.name?.familyName || displayName?.split(' ').slice(1).join(' ') || '',
      picture: photos && photos[0] ? photos[0].value : null,
      accessToken,
      provider: 'microsoft',
    };

    const user = await this.outlookOAuthService.validateOAuthUser(microsoftUser);
    done(null, user);
  }
}