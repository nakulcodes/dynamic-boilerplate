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
        database: 'boilerplate',
        url : 'postgresql://localhost:5433/boilerplate',
        // host: configService.get<string>('DATABASE_HOST', 'localhost'),
        // port: configService.get<number>('DATABASE_PORT', 5432),
        // username: 'postgres',
        // password: 'postgres',
        entities: [GitHubToken, User],
        synchronize: true,
        // logging: configService.get<boolean>('DB_LOGGING', false),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [GitHubTokenRepository],
  exports: [GitHubTokenRepository],
})
export class DatabaseModule { }