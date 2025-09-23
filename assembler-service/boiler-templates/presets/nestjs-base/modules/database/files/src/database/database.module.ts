import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from './database.service';
import { SampleRepository } from './repositories/sample.repository';
import { createDatabaseConfig } from './database.config';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        createDatabaseConfig(configService),
    }),
  ],
  providers: [DatabaseService, SampleRepository],
})
export class DatabaseModule {}