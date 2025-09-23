import { Module } from '@nestjs/common';
import { ProjectHistoryController } from './project-history.controller';
import { ProjectHistoryService } from './project-history.service';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [ProjectHistoryController],
  providers: [ProjectHistoryService],
  exports: [ProjectHistoryService],
})
export class ProjectHistoryModule {}