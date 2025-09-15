import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '@modules/users/users.module';
import { GoogleOAuthService } from './google-oauth.service';
import { GoogleOAuthController } from './google-oauth.controller';
import { GoogleStrategy } from './google.strategy';

@Module({
  imports: [PassportModule, UsersModule],
  controllers: [GoogleOAuthController],
  providers: [GoogleOAuthService, GoogleStrategy],
  exports: [GoogleOAuthService],
})
export class GoogleOAuthModule {}