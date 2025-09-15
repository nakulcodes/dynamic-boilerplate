import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TypedConfigService } from '@modules/config/config.service';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: TypedConfigService,
  ) {}

  async onModuleInit() {
    if (!this.dataSource.isInitialized) {
      await this.dataSource.initialize();
      this.logger.log('Database connection initialized');
    }

    await this.runMigrations();
  }

  /**
   * Get the DataSource instance
   */
  getDataSource(): DataSource {
    return this.dataSource;
  }

  /**
   * Check if database is connected
   */
  async isConnected(): Promise<boolean> {
    try {
      if (!this.dataSource.isInitialized) {
        return false;
      }
      // Try a simple query
      await this.dataSource.query('SELECT 1');
      return true;
    } catch (error) {
      this.logger.error('Database connection check failed:', error);
      return false;
    }
  }

  /**
   * Run pending migrations
   */
  async runMigrations(): Promise<void> {
    try {
      const dbConfig = this.configService.database;

      if (!dbConfig) {
        this.logger.warn('No database configuration found, skipping migrations');
        return;
      }

      if (dbConfig.MIGRATION_STRATEGY === 'auto') {
        this.logger.log('Running pending migrations...');
        await this.dataSource.runMigrations({ transaction: 'all' });
        this.logger.log('Migrations completed successfully');
      } else {
        this.logger.log('Migration strategy is manual, skipping auto-migration');
      }
    } catch (error) {
      this.logger.error('Migration failed:', error);
      throw error;
    }
  }

  /**
   * Revert last migration
   */
  async revertLastMigration(): Promise<void> {
    try {
      this.logger.log('Reverting last migration...');
      await this.dataSource.undoLastMigration({ transaction: 'all' });
      this.logger.log('Last migration reverted successfully');
    } catch (error) {
      this.logger.error('Migration revert failed:', error);
      throw error;
    }
  }

  /**
   * Get migration status
   */
  async getMigrationStatus(): Promise<{
    pending: string[];
    executed: string[];
  }> {
    try {
      const executedMigrations = await this.dataSource.query(
        'SELECT * FROM migrations ORDER BY timestamp ASC'
      );

      const allMigrations = this.dataSource.migrations;
      const executedNames = executedMigrations.map((m: any) => m.name);

      const pending = allMigrations
        .filter(migration => !executedNames.includes(migration.name))
        .map(migration => migration.name);

      return {
        pending,
        executed: executedNames,
      };
    } catch (error) {
      this.logger.error('Failed to get migration status:', error);
      return { pending: [], executed: [] };
    }
  }

  /**
   * Create database if it doesn't exist (PostgreSQL)
   */
  async createDatabase(): Promise<void> {
    const dbConfig = this.configService.database;

    if (!dbConfig || dbConfig.DB_TYPE !== 'postgres') {
      this.logger.warn('Database creation only supported for PostgreSQL');
      return;
    }

    try {
      // Create a connection to the default postgres database
      const tempDataSource = new DataSource({
        type: 'postgres',
        host: dbConfig.DB_HOST,
        port: dbConfig.DB_PORT,
        username: dbConfig.DB_USERNAME,
        password: dbConfig.DB_PASSWORD,
        database: 'postgres', // Connect to default database
      });

      await tempDataSource.initialize();

      // Check if database exists
      const result = await tempDataSource.query(
        'SELECT 1 FROM pg_database WHERE datname = $1',
        [dbConfig.DB_DATABASE]
      );

      if (result.length === 0) {
        this.logger.log(`Creating database: ${dbConfig.DB_DATABASE}`);
        await tempDataSource.query(`CREATE DATABASE "${dbConfig.DB_DATABASE}"`);
        this.logger.log('Database created successfully');
      } else {
        this.logger.log('Database already exists');
      }

      await tempDataSource.destroy();
    } catch (error) {
      this.logger.error('Database creation failed:', error);
      throw error;
    }
  }

  /**
   * Drop database (use with caution!)
   */
  async dropDatabase(): Promise<void> {
    const dbConfig = this.configService.database;

    if (!dbConfig) {
      throw new Error('No database configuration found');
    }

    if (this.configService.isProduction) {
      throw new Error('Database dropping is not allowed in production');
    }

    try {
      await this.dataSource.dropDatabase();
      this.logger.warn('Database dropped successfully');
    } catch (error) {
      this.logger.error('Database drop failed:', error);
      throw error;
    }
  }

  /**
   * Synchronize database schema (use only in development)
   */
  async synchronizeSchema(): Promise<void> {
    if (this.configService.isProduction) {
      throw new Error('Schema synchronization is not allowed in production');
    }

    try {
      this.logger.log('Synchronizing database schema...');
      await this.dataSource.synchronize();
      this.logger.log('Schema synchronized successfully');
    } catch (error) {
      this.logger.error('Schema synchronization failed:', error);
      throw error;
    }
  }

  /**
   * Get database health information
   */
  async getHealthInfo(): Promise<{
    connected: boolean;
    database: string;
    type: string;
    migrationsExecuted: number;
    migrationsPending: number;
  }> {
    try {
      const dbConfig = this.configService.database;
      const connected = await this.isConnected();
      const migrationStatus = await this.getMigrationStatus();

      return {
        connected,
        database: dbConfig?.DB_DATABASE || 'unknown',
        type: dbConfig?.DB_TYPE || 'unknown',
        migrationsExecuted: migrationStatus.executed.length,
        migrationsPending: migrationStatus.pending.length,
      };
    } catch (error) {
      this.logger.error('Failed to get health info:', error);
      return {
        connected: false,
        database: 'unknown',
        type: 'unknown',
        migrationsExecuted: 0,
        migrationsPending: 0,
      };
    }
  }
}