import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const createDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  // Check if DATABASE_URL is available
  const databaseUrl = configService.get<string>('DATABASE_URL');

  if (databaseUrl) {
    return {
      url: databaseUrl,
      entities: [__dirname + '/entities/*.entity{.ts,.js}'],
      migrations: [__dirname + '/migrations/*{.ts,.js}'],
      synchronize: configService.get<boolean>('DB_SYNCHRONIZE', false) &&
        configService.get<string>('NODE_ENV') !== 'production',
      logging: configService.get<boolean>('DB_LOGGING', false),
      ssl: configService.get<boolean>('DB_SSL', false),
      autoLoadEntities: true,
      retryAttempts: 3,
      retryDelay: 3000,
    };
  }

  // Fallback to individual variables
  return {
    type: configService.get<'postgres' | 'mysql'>('DB_TYPE', 'postgres'),
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', 5432),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_DATABASE'),
    entities: [__dirname + '/entities/*.entity{.ts,.js}'],
    migrations: [__dirname + '/migrations/*{.ts,.js}'],
    synchronize: configService.get<boolean>('DB_SYNCHRONIZE', false) &&
      configService.get<string>('NODE_ENV') !== 'production',
    logging: configService.get<boolean>('DB_LOGGING', false),
    ssl: configService.get<boolean>('DB_SSL', false),
    autoLoadEntities: true,
    retryAttempts: 3,
    retryDelay: 3000,
  };
};