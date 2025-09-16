import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SecurityService } from './security.service';
import { SecurityController } from './security.controller';
import { SecurityInterceptor } from './interceptors/security.interceptor';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          name: 'short',
          ttl: configService.get<number>('RATE_LIMIT_TTL', 60000), // 1 minute
          limit: configService.get<number>('RATE_LIMIT_MAX', 100), // 100 requests per minute
        },
        {
          name: 'medium',
          ttl: 60000 * 5, // 5 minutes
          limit: 500, // 500 requests per 5 minutes
        },
        {
          name: 'long',
          ttl: 60000 * 60, // 1 hour
          limit: 2000, // 2000 requests per hour
        },
      ],
    }),
  ],
  controllers: [SecurityController],
  providers: [
    SecurityService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: SecurityInterceptor,
    },
  ],
  exports: [SecurityService],
})
export class SecurityModule {}