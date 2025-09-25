import { ZodError } from 'zod';
import { configSchema } from './config.schema';

export function validateConfig(config: Record<string, unknown>) {
  const result = configSchema.safeParse(config);

  if (!result.success) {
    const errors = result.error.errors.map(
      (error: ZodError['errors'][0]) => `${error.path.join('.')}: ${error.message}`
    );
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }

  return result.data;
}