import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TypedConfigService } from '@modules/config/config.service';
import { DatabaseService } from './database.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [TypedConfigService],
      useFactory: async (configService: TypedConfigService) => {
        const dbConfig = configService.database;

        if (!dbConfig) {
          throw new Error('Database configuration is required');
        }

        // Use DATABASE_URL if available, otherwise construct from parts
        const connectionConfig = dbConfig.DATABASE_URL
          ? { url: dbConfig.DATABASE_URL }
          : {
              type: dbConfig.DB_TYPE as any,
              host: dbConfig.DB_HOST,
              port: dbConfig.DB_PORT,
              username: dbConfig.DB_USERNAME,
              password: dbConfig.DB_PASSWORD,
              database: dbConfig.DB_DATABASE,
            };

        return {
          ...connectionConfig,
          entities: [__dirname + '/../../database/entities/*.entity{.ts,.js}'],
          migrations: [__dirname + '/../../database/migrations/*{.ts,.js}'],
          synchronize: dbConfig.DB_SYNCHRONIZE && !configService.isProduction,
          logging: dbConfig.DB_LOGGING,
          ssl: dbConfig.DB_SSL,
          autoLoadEntities: true,
          retryAttempts: 3,
          retryDelay: 3000,
          migrationsRun: false, // We handle migrations manually in DatabaseService
        };
      },
    }),
  ],
  providers: [DatabaseService],
  exports: [DatabaseService, TypeOrmModule],
})
export class DatabaseModule {}