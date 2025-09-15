import { Logger } from '@nestjs/common';
import { ConfigFactory } from '@nestjs/config';
import { ZodError } from 'zod';
import {
  ConfigSchema,
  AppConfigSchema,
  DatabaseConfigSchema,
  JwtConfigSchema,
  GoogleOAuthSchema,
  GitHubOAuthSchema,
  MicrosoftOAuthSchema,
  MailConfigSchema,
  ResendMailSchema,
  SmtpMailSchema,
  RedisConfigSchema,
  MemoryCacheConfigSchema,
  AwsConfigSchema,
  TwilioConfigSchema,
  AuditConfigSchema,
  Config,
} from './config.schema';

const logger = new Logger('ConfigValidation');

/**
 * Validates and transforms environment variables into typed configuration
 */
export const configFactory: ConfigFactory<Config> = (): Config => {
  try {
    // Extract and validate each configuration section
    const rawConfig = {
      app: validateAppConfig(),
      database: validateDatabaseConfig(),
      jwt: validateJwtConfig(),
      google: validateGoogleOAuthConfig(),
      github: validateGitHubOAuthConfig(),
      microsoft: validateMicrosoftOAuthConfig(),
      mail: validateMailConfig(),
      resend: validateResendMailConfig(),
      smtp: validateSmtpMailConfig(),
      redis: validateRedisConfig(),
      memoryCache: validateMemoryCacheConfig(),
      aws: validateAwsConfig(),
      twilio: validateTwilioConfig(),
      audit: validateAuditConfig(),
    };

    // Remove undefined sections
    const config = Object.fromEntries(
      Object.entries(rawConfig).filter(([, value]) => value !== undefined)
    ) as Config;

    // Final validation
    const validatedConfig = ConfigSchema.parse(config);

    logger.log('Configuration validated successfully');
    logger.log(`Environment: ${validatedConfig.app.NODE_ENV}`);
    logger.log(`Available sections: ${Object.keys(validatedConfig).join(', ')}`);

    return validatedConfig;
  } catch (error) {
    if (error instanceof ZodError) {
      logger.error('Configuration validation failed:');
      error.errors.forEach((err) => {
        logger.error(`  ${err.path.join('.')}: ${err.message}`);
      });
    } else {
      logger.error('Configuration error:', error);
    }
    throw new Error('Configuration validation failed');
  }
};

function validateAppConfig() {
  return AppConfigSchema.parse({
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    APP_NAME: process.env.APP_NAME,
    API_PREFIX: process.env.API_PREFIX,
    CORS_ENABLED: process.env.CORS_ENABLED,
    CORS_ORIGIN: process.env.CORS_ORIGIN,
  });
}

function validateDatabaseConfig() {
  const hasDbConfig = process.env.DATABASE_URL ||
    process.env.DB_HOST ||
    process.env.DB_TYPE;

  if (!hasDbConfig) return undefined;

  return DatabaseConfigSchema.parse({
    DATABASE_URL: process.env.DATABASE_URL,
    DB_TYPE: process.env.DB_TYPE,
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_USERNAME: process.env.DB_USERNAME,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_DATABASE: process.env.DB_DATABASE,
    DB_SYNCHRONIZE: process.env.DB_SYNCHRONIZE,
    DB_LOGGING: process.env.DB_LOGGING,
    DB_SSL: process.env.DB_SSL,
    MIGRATION_STRATEGY: process.env.MIGRATION_STRATEGY,
  });
}

function validateJwtConfig() {
  if (!process.env.JWT_SECRET) return undefined;

  return JwtConfigSchema.parse({
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN,
  });
}

function validateGoogleOAuthConfig() {
  if (!process.env.GOOGLE_CLIENT_ID) return undefined;

  return GoogleOAuthSchema.parse({
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
  });
}

function validateGitHubOAuthConfig() {
  if (!process.env.GITHUB_CLIENT_ID) return undefined;

  return GitHubOAuthSchema.parse({
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL,
  });
}

function validateMicrosoftOAuthConfig() {
  if (!process.env.MICROSOFT_CLIENT_ID) return undefined;

  return MicrosoftOAuthSchema.parse({
    MICROSOFT_CLIENT_ID: process.env.MICROSOFT_CLIENT_ID,
    MICROSOFT_CLIENT_SECRET: process.env.MICROSOFT_CLIENT_SECRET,
    MICROSOFT_CALLBACK_URL: process.env.MICROSOFT_CALLBACK_URL,
  });
}

function validateMailConfig() {
  if (!process.env.MAIL_FROM) return undefined;

  return MailConfigSchema.parse({
    MAIL_FROM: process.env.MAIL_FROM,
    MAIL_FROM_NAME: process.env.MAIL_FROM_NAME,
  });
}

function validateResendMailConfig() {
  if (!process.env.RESEND_API_KEY) return undefined;

  return ResendMailSchema.parse({
    RESEND_API_KEY: process.env.RESEND_API_KEY,
  });
}

function validateSmtpMailConfig() {
  if (!process.env.SMTP_HOST) return undefined;

  return SmtpMailSchema.parse({
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_SECURE: process.env.SMTP_SECURE,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
  });
}

function validateRedisConfig() {
  if (!process.env.REDIS_URL && !process.env.REDIS_HOST) return undefined;

  return RedisConfigSchema.parse({
    REDIS_URL: process.env.REDIS_URL,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    REDIS_DB: process.env.REDIS_DB,
  });
}

function validateMemoryCacheConfig() {
  const hasCacheConfig = process.env.CACHE_TTL ||
    process.env.CACHE_MAX_KEYS ||
    process.env.CACHE_CHECK_PERIOD;

  if (!hasCacheConfig) return undefined;

  return MemoryCacheConfigSchema.parse({
    CACHE_TTL: process.env.CACHE_TTL,
    CACHE_CHECK_PERIOD: process.env.CACHE_CHECK_PERIOD,
    CACHE_MAX_KEYS: process.env.CACHE_MAX_KEYS,
    CACHE_USE_CLONES: process.env.CACHE_USE_CLONES,
  });
}

function validateAwsConfig() {
  if (!process.env.AWS_ACCESS_KEY_ID) return undefined;

  return AwsConfigSchema.parse({
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION,
    AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
  });
}

function validateTwilioConfig() {
  if (!process.env.TWILIO_ACCOUNT_SID) return undefined;

  return TwilioConfigSchema.parse({
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
    TWILIO_WHATSAPP_NUMBER: process.env.TWILIO_WHATSAPP_NUMBER,
  });
}

function validateAuditConfig() {
  if (!process.env.AUDIT_SINK) return undefined;

  return AuditConfigSchema.parse({
    AUDIT_SINK: process.env.AUDIT_SINK,
    AUDIT_LOG_LEVEL: process.env.AUDIT_LOG_LEVEL,
    AUDIT_RETENTION_DAYS: process.env.AUDIT_RETENTION_DAYS,
  });
}