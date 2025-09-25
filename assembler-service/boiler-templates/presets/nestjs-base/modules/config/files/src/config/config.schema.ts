import { z } from 'zod';

export const configSchema = z.object({
  // Application settings
  port: z.number().min(1).max(65535).default(3000),
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  appName: z.string().min(1).default('{{projectName}}'),

  // API settings
  apiPrefix: z.string().default('api'),

  // CORS settings
  corsEnabled: z.boolean().default(false),
  corsOrigin: z.string().url().optional().or(z.literal('*')).default('http://localhost:3000'),
});

export type Config = z.infer<typeof configSchema>;