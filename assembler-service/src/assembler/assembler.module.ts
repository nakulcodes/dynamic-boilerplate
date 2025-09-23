import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AssemblerService } from './assembler.service';
import { AssemblerController } from './assembler.controller';
import { StorageModule } from '../storage/storage.module';
import { GitHubModule } from '../github/github.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [ConfigModule, StorageModule, GitHubModule, DatabaseModule],
  controllers: [AssemblerController],
  providers: [AssemblerService],
  exports: [AssemblerService],
})
export class AssemblerModule {}