import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '@modules/users/users.module';
import { GitHubOAuthService } from './github-oauth.service';
import { GitHubOAuthController } from './github-oauth.controller';
import { GitHubStrategy } from './github.strategy';

@Module({
  imports: [
    PassportModule,
    ConfigModule,
    UsersModule,
  ],
  controllers: [GitHubOAuthController],
  providers: [GitHubOAuthService, GitHubStrategy],
  exports: [GitHubOAuthService],
})
export class GitHubOAuthModule {}