import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { GitHubOAuthStrategy } from './github-oauth.strategy';
import { GitHubModule } from '../github/github.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'github' }),
    ConfigModule,
    GitHubModule,
  ],
  controllers: [AuthController],
  providers: [GitHubOAuthStrategy],
  exports: [GitHubOAuthStrategy],
})
export class AuthModule {}