import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GitHubService } from './github.service';
import { GitHubController } from './github.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [ConfigModule, DatabaseModule],
  controllers: [GitHubController],
  providers: [GitHubService],
  exports: [GitHubService],
})
export class GitHubModule {}