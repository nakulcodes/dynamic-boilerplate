import { Repository, DataSource, EntityTarget } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class BaseRepository<T> extends Repository<T> {
  constructor(
    private dataSource: DataSource,
    private entityTarget: EntityTarget<T>,
  ) {
    super(entityTarget, dataSource.createEntityManager());
  }

  async findById(id: number): Promise<T | null> {
    return this.findOne({ where: { id } as any });
  }

  async findByIdOrFail(id: number): Promise<T> {
    return this.findOneByOrFail({ id } as any);
  }
}