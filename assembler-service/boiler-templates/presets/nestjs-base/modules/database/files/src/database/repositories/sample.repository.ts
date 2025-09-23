import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from './base.repository';
import { SampleEntity } from '../entities/sample.entity';

@Injectable()
export class SampleRepository extends BaseRepository<SampleEntity> {
  constructor(dataSource: DataSource) {
    super(dataSource, SampleEntity);
  }

  async findByName(name: string): Promise<SampleEntity | null> {
    return this.findOne({ where: { name } });
  }

  async findActiveEntities(): Promise<SampleEntity[]> {
    return this.find({ where: { isActive: true } });
  }

  async findByPartialName(partialName: string): Promise<SampleEntity[]> {
    return this.createQueryBuilder('sample')
      .where('sample.name ILIKE :name', { name: `%${partialName}%` })
      .getMany();
  }
}