import { z } from 'zod';

// Application Configuration Schema
export const AppConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().min(1).max(65535).default(3000),
  APP_NAME: z.string().min(1).default('NestJS App'),
  API_PREFIX: z.string().default('api'),
  CORS_ENABLED: z.coerce.boolean().default(true),
  CORS_ORIGIN: z.string().optional(),
});

// Database Configuration Schema
export const DatabaseConfigSchema = z.object({
  DATABASE_URL: z.string().url().optional(),
  DB_TYPE: z.enum(['postgres', 'mysql', 'mariadb', 'sqlite', 'mongodb']).default('postgres'),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().min(1).max(65535).default(5432),
  DB_USERNAME: z.string().default('postgres'),
  DB_PASSWORD: z.string().default(''),
  DB_DATABASE: z.string().default('app_db'),
  DB_SYNCHRONIZE: z.coerce.boolean().default(false),
  DB_LOGGING: z.coerce.boolean().default(false),
  DB_SSL: z.coerce.boolean().default(false),
  MIGRATION_STRATEGY: z.enum(['auto', 'manual']).default('manual'),
});

// JWT Authentication Schema
export const JwtConfigSchema = z.object({
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('1h'),
  JWT_REFRESH_SECRET: z.string().min(32).optional(),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
});

// OAuth Configuration Schemas
export const GoogleOAuthSchema = z.object({
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_CALLBACK_URL: z.string().url(),
});

export const GitHubOAuthSchema = z.object({
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  GITHUB_CALLBACK_URL: z.string().url(),
});

export const MicrosoftOAuthSchema = z.object({
  MICROSOFT_CLIENT_ID: z.string().min(1),
  MICROSOFT_CLIENT_SECRET: z.string().min(1),
  MICROSOFT_CALLBACK_URL: z.string().url(),
});

// Mail Configuration Schemas
export const MailConfigSchema = z.object({
  MAIL_FROM: z.string().email(),
  MAIL_FROM_NAME: z.string().default('App Mailer'),
});

export const ResendMailSchema = z.object({
  RESEND_API_KEY: z.string().min(1),
});

export const SmtpMailSchema = z.object({
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().min(1).max(65535).default(587),
  SMTP_SECURE: z.coerce.boolean().default(false),
  SMTP_USER: z.string().min(1),
  SMTP_PASS: z.string().min(1),
});

// Cache Configuration Schemas
export const RedisConfigSchema = z.object({
  REDIS_URL: z.string().url().optional(),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().min(1).max(65535).default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.coerce.number().min(0).default(0),
});

export const MemoryCacheConfigSchema = z.object({
  CACHE_TTL: z.coerce.number().min(1).default(3600),
  CACHE_CHECK_PERIOD: z.coerce.number().min(1).default(600),
  CACHE_MAX_KEYS: z.coerce.number().min(1).default(10000),
  CACHE_USE_CLONES: z.coerce.boolean().default(false),
});

// AWS Configuration Schema
export const AwsConfigSchema = z.object({
  AWS_ACCESS_KEY_ID: z.string().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().min(1),
  AWS_REGION: z.string().default('us-east-1'),
  AWS_S3_BUCKET: z.string().min(1),
});

// Twilio Configuration Schema
export const TwilioConfigSchema = z.object({
  TWILIO_ACCOUNT_SID: z.string().min(1),
  TWILIO_AUTH_TOKEN: z.string().min(1),
  TWILIO_PHONE_NUMBER: z.string().min(1),
  TWILIO_WHATSAPP_NUMBER: z.string().optional(),
});

// Audit Log Configuration Schema
export const AuditConfigSchema = z.object({
  AUDIT_SINK: z.enum(['database', 'file', 'console']).default('database'),
  AUDIT_LOG_LEVEL: z.enum(['all', 'critical', 'sensitive']).default('all'),
  AUDIT_RETENTION_DAYS: z.coerce.number().min(1).default(365),
});

// Complete Configuration Schema
export const ConfigSchema = z.object({
  app: AppConfigSchema,
  database: DatabaseConfigSchema.optional(),
  jwt: JwtConfigSchema.optional(),
  google: GoogleOAuthSchema.optional(),
  github: GitHubOAuthSchema.optional(),
  microsoft: MicrosoftOAuthSchema.optional(),
  mail: MailConfigSchema.optional(),
  resend: ResendMailSchema.optional(),
  smtp: SmtpMailSchema.optional(),
  redis: RedisConfigSchema.optional(),
  memoryCache: MemoryCacheConfigSchema.optional(),
  aws: AwsConfigSchema.optional(),
  twilio: TwilioConfigSchema.optional(),
  audit: AuditConfigSchema.optional(),
});

export type AppConfig = z.infer<typeof AppConfigSchema>;
export type DatabaseConfig = z.infer<typeof DatabaseConfigSchema>;
export type JwtConfig = z.infer<typeof JwtConfigSchema>;
export type GoogleOAuthConfig = z.infer<typeof GoogleOAuthSchema>;
export type GitHubOAuthConfig = z.infer<typeof GitHubOAuthSchema>;
export type MicrosoftOAuthConfig = z.infer<typeof MicrosoftOAuthSchema>;
export type MailConfig = z.infer<typeof MailConfigSchema>;
export type ResendMailConfig = z.infer<typeof ResendMailSchema>;
export type SmtpMailConfig = z.infer<typeof SmtpMailSchema>;
export type RedisConfig = z.infer<typeof RedisConfigSchema>;
export type MemoryCacheConfig = z.infer<typeof MemoryCacheConfigSchema>;
export type AwsConfig = z.infer<typeof AwsConfigSchema>;
export type TwilioConfig = z.infer<typeof TwilioConfigSchema>;
export type AuditConfig = z.infer<typeof AuditConfigSchema>;
export type Config = z.infer<typeof ConfigSchema>;