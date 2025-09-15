import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AssemblerModule } from './assembler/assembler.module';
import { StorageModule } from './storage/storage.module';
import { DatabaseModule } from './database/database.module';
import { GitHubModule } from './github/github.module';

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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}