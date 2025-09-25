import { validateConfig } from './config.validation';

export const configuration = () => {
  const config = {
    // Application settings
    port: parseInt(process.env.PORT, 10) || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    appName: process.env.APP_NAME || '{{projectName}}',

    // API settings
    apiPrefix: process.env.API_PREFIX || 'api',

    // CORS settings
    corsEnabled: process.env.CORS_ENABLED === 'true',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  };

  return validateConfig(config);
};