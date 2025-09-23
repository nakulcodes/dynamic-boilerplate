import { DataSource } from 'typeorm';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';

export class DatabaseSeeder {
  private readonly logger = new Logger(DatabaseSeeder.name);

  async run(appModule: any): Promise<void> {
    const app = await NestFactory.createApplicationContext(appModule);
    const dataSource = app.get(DataSource);

    try {
      this.logger.log('Starting database seeding...');

      await this.seedSampleEntities(dataSource);

      this.logger.log('Database seeding completed successfully');
    } catch (error) {
      this.logger.error('Database seeding failed:', error);
      throw error;
    } finally {
      await app.close();
    }
  }

  private async seedSampleEntities(dataSource: DataSource): Promise<void> {
    this.logger.log('Seeding sample entities...');

    const { SampleEntity } = await import('../entities/sample.entity');
    const sampleRepository = dataSource.getRepository(SampleEntity);

    const existingEntities = await sampleRepository.count();

    if (existingEntities === 0) {
      const sampleData = [
        {
          name: 'Sample Entity 1',
          description: 'This is the first sample entity',
          isActive: true
        },
        {
          name: 'Sample Entity 2',
          description: 'This is the second sample entity',
          isActive: true
        },
        {
          name: 'Inactive Sample',
          description: 'This sample entity is inactive',
          isActive: false
        }
      ];

      for (const entityData of sampleData) {
        const entity = sampleRepository.create(entityData);
        await sampleRepository.save(entity);
      }

      this.logger.log(`Seeded ${sampleData.length} sample entities`);
    } else {
      this.logger.log('Sample entities already exist, skipping seed');
    }
  }
}

// Run seeder if called directly
// Usage: ts-node -r tsconfig-paths/register src/database/seeds/database.seeder.ts
// if (require.main === module) {
//   import('./../../app.module').then(({ AppModule }) => {
//     const seeder = new DatabaseSeeder();
//     seeder.run(AppModule).catch(console.error);
//   });
// }