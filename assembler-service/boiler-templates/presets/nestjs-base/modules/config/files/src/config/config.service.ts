import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { Config } from './config.schema';

@Injectable()
export class AppConfigService {
  private readonly config: Config;

  constructor(private nestConfigService: NestConfigService) {
    this.config = this.nestConfigService.get<Config>('configuration')!;
  }

  /**
   * Get a configuration value by key
   */
  get<T = any>(key: string, defaultValue?: T): T {
    return this.nestConfigService.get<T>(key, defaultValue);
  }

  /**
   * Get the complete validated configuration
   */
  getConfig(): Config {
    return this.config;
  }

  /**
   * Get environment name
   */
  get environment(): string {
    return this.config.nodeEnv;
  }

  /**
   * Check if running in development
   */
  get isDevelopment(): boolean {
    return this.config.nodeEnv === 'development';
  }

  /**
   * Check if running in production
   */
  get isProduction(): boolean {
    return this.config.nodeEnv === 'production';
  }

  /**
   * Check if running in test
   */
  get isTest(): boolean {
    return this.config.nodeEnv === 'test';
  }

  /**
   * Get application port
   */
  get port(): number {
    return this.config.port;
  }

  /**
   * Get application name
   */
  get appName(): string {
    return this.config.appName;
  }

  /**
   * Get API prefix
   */
  get apiPrefix(): string {
    return this.config.apiPrefix;
  }

  /**
   * Check if CORS is enabled
   */
  get corsEnabled(): boolean {
    return this.config.corsEnabled;
  }

  /**
   * Get CORS origin
   */
  get corsOrigin(): string {
    return this.config.corsOrigin;
  }
}