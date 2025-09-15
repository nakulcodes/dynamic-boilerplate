import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '@modules/users/users.module';
import { OutlookOAuthService } from './outlook-oauth.service';
import { OutlookOAuthController } from './outlook-oauth.controller';
import { MicrosoftStrategy } from './microsoft.strategy';

@Module({
  imports: [
    PassportModule,
    ConfigModule,
    UsersModule,
  ],
  controllers: [OutlookOAuthController],
  providers: [OutlookOAuthService, MicrosoftStrategy],
  exports: [OutlookOAuthService],
})
export class OutlookOAuthModule {}