import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GitHubToken } from './entities/github-token.entity';
import { GitHubTokenRepository } from './repositories/github-token.repository';
import { User } from './entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        entities: [GitHubToken, User],
        synchronize: configService.get<boolean>('DB_SYNCHRONIZE'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [GitHubTokenRepository],
  exports: [GitHubTokenRepository],
})
export class DatabaseModule { }