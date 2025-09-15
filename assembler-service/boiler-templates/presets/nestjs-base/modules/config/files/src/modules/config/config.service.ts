import { Injectable, Logger } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import {
  Config,
  AppConfig,
  DatabaseConfig,
  JwtConfig,
  GoogleOAuthConfig,
  GitHubOAuthConfig,
  MicrosoftOAuthConfig,
  MailConfig,
  ResendMailConfig,
  SmtpMailConfig,
  RedisConfig,
  MemoryCacheConfig,
  AwsConfig,
  TwilioConfig,
  AuditConfig,
} from './config.schema';

@Injectable()
export class TypedConfigService {
  private readonly logger = new Logger(TypedConfigService.name);
  private readonly config: Config;

  constructor(private nestConfigService: NestConfigService) {
    this.config = this.nestConfigService.get<Config>('validatedConfig');

    if (!this.config) {
      throw new Error('Configuration validation failed. Check your environment variables.');
    }

    this.logger.log('Configuration loaded and validated successfully');
  }

  /**
   * Get the complete validated configuration
   */
  get all(): Config {
    return this.config;
  }

  /**
   * Get application configuration
   */
  get app(): AppConfig {
    return this.config.app;
  }

  /**
   * Get database configuration
   */
  get database(): DatabaseConfig | undefined {
    return this.config.database;
  }

  /**
   * Get JWT configuration
   */
  get jwt(): JwtConfig | undefined {
    return this.config.jwt;
  }

  /**
   * Get Google OAuth configuration
   */
  get google(): GoogleOAuthConfig | undefined {
    return this.config.google;
  }

  /**
   * Get GitHub OAuth configuration
   */
  get github(): GitHubOAuthConfig | undefined {
    return this.config.github;
  }

  /**
   * Get Microsoft OAuth configuration
   */
  get microsoft(): MicrosoftOAuthConfig | undefined {
    return this.config.microsoft;
  }

  /**
   * Get mail configuration
   */
  get mail(): MailConfig | undefined {
    return this.config.mail;
  }

  /**
   * Get Resend mail configuration
   */
  get resend(): ResendMailConfig | undefined {
    return this.config.resend;
  }

  /**
   * Get SMTP mail configuration
   */
  get smtp(): SmtpMailConfig | undefined {
    return this.config.smtp;
  }

  /**
   * Get Redis configuration
   */
  get redis(): RedisConfig | undefined {
    return this.config.redis;
  }

  /**
   * Get memory cache configuration
   */
  get memoryCache(): MemoryCacheConfig | undefined {
    return this.config.memoryCache;
  }

  /**
   * Get AWS configuration
   */
  get aws(): AwsConfig | undefined {
    return this.config.aws;
  }

  /**
   * Get Twilio configuration
   */
  get twilio(): TwilioConfig | undefined {
    return this.config.twilio;
  }

  /**
   * Get audit configuration
   */
  get audit(): AuditConfig | undefined {
    return this.config.audit;
  }

  /**
   * Check if a specific configuration section is available
   */
  hasConfig(section: keyof Config): boolean {
    return this.config[section] !== undefined;
  }

  /**
   * Get database URL with fallback construction
   */
  getDatabaseUrl(): string {
    if (this.database?.DATABASE_URL) {
      return this.database.DATABASE_URL;
    }

    if (this.database) {
      const { DB_TYPE, DB_USERNAME, DB_PASSWORD, DB_HOST, DB_PORT, DB_DATABASE } = this.database;
      return `${DB_TYPE}://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}`;
    }

    throw new Error('Database configuration is not available');
  }

  /**
   * Get JWT configuration with validation
   */
  getJwtConfig(): Required<JwtConfig> {
    if (!this.jwt) {
      throw new Error('JWT configuration is not available');
    }

    return {
      JWT_SECRET: this.jwt.JWT_SECRET,
      JWT_EXPIRES_IN: this.jwt.JWT_EXPIRES_IN,
      JWT_REFRESH_SECRET: this.jwt.JWT_REFRESH_SECRET || this.jwt.JWT_SECRET,
      JWT_REFRESH_EXPIRES_IN: this.jwt.JWT_REFRESH_EXPIRES_IN,
    };
  }

  /**
   * Get OAuth configuration for a specific provider
   */
  getOAuthConfig(provider: 'google' | 'github' | 'microsoft') {
    const config = this.config[provider];
    if (!config) {
      throw new Error(`${provider} OAuth configuration is not available`);
    }
    return config;
  }

  /**
   * Get mail provider configuration
   */
  getMailConfig(): { provider: 'resend' | 'smtp'; config: ResendMailConfig | SmtpMailConfig; common: MailConfig } {
    if (!this.mail) {
      throw new Error('Mail configuration is not available');
    }

    if (this.resend) {
      return {
        provider: 'resend',
        config: this.resend,
        common: this.mail,
      };
    }

    if (this.smtp) {
      return {
        provider: 'smtp',
        config: this.smtp,
        common: this.mail,
      };
    }

    throw new Error('No mail provider configuration found');
  }

  /**
   * Get cache provider configuration
   */
  getCacheConfig(): { provider: 'redis' | 'memory'; config: RedisConfig | MemoryCacheConfig } {
    if (this.redis) {
      return {
        provider: 'redis',
        config: this.redis,
      };
    }

    if (this.memoryCache) {
      return {
        provider: 'memory',
        config: this.memoryCache,
      };
    }

    throw new Error('No cache provider configuration found');
  }

  /**
   * Get environment name
   */
  get environment(): string {
    return this.app.NODE_ENV;
  }

  /**
   * Check if running in development
   */
  get isDevelopment(): boolean {
    return this.app.NODE_ENV === 'development';
  }

  /**
   * Check if running in production
   */
  get isProduction(): boolean {
    return this.app.NODE_ENV === 'production';
  }

  /**
   * Check if running in test
   */
  get isTest(): boolean {
    return this.app.NODE_ENV === 'test';
  }
}