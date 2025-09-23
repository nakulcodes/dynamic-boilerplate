import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AssemblerModule } from './assembler/assembler.module';
import { StorageModule } from './storage/storage.module';
import { DatabaseModule } from './database/database.module';
import { GitHubModule } from './github/github.module';
import { AuthModule } from './auth/auth.module';
import { ProjectHistoryModule } from './project-history/project-history.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AssemblerModule,
    StorageModule,
    GitHubModule,
    AuthModule,
    ProjectHistoryModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}