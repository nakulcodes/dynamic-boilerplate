import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@modules/auth/auth.module';
import { UsersModule } from '@modules/users/users.module';
import { LoggingModule } from './common/logging/logging.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configuration } from './config/configuration';
import { GitHubOAuthModule } from '@modules/auth/github-oauth/github-oauth.module';
import { GoogleOAuthModule } from '@modules/auth/google-oauth/google-oauth.module';
import { GoogleCalendarModule } from './integrations/google-calendar/google-calendar.module';
import { HealthModule } from '@modules/health/health.module';
import { MailModule } from '@modules/mail/mail.module';
import { NotificationsModule } from '@modules/notifications/notifications.module';
// MODULE_IMPORTS_PLACEHOLDER

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite',
        database: configService.get<string>('DATABASE_URL') || 'database.sqlite',
        autoLoadEntities: true,
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
      }),
    }),
    LoggingModule,
    AuthModule,
    UsersModule,
    GitHubOAuthModule,
    GoogleOAuthModule,
    GoogleCalendarModule,
    HealthModule,
    MailModule,
    NotificationsModule,
    // MODULE_REGISTER_PLACEHOLDER
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}