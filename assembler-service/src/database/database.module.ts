import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GitHubToken } from './entities/github-token.entity';
import { GitHubTokenRepository } from './repositories/github-token.repository';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite',
        database: configService.get<string>('DATABASE_PATH', 'data/assembler.db'),
        entities: [GitHubToken],
        synchronize: configService.get<boolean>('DB_SYNCHRONIZE', true),
        logging: configService.get<boolean>('DB_LOGGING', false),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [GitHubTokenRepository],
  exports: [GitHubTokenRepository],
})
export class DatabaseModule {}