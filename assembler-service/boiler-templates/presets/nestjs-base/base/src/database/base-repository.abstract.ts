import {
  Repository,
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  EntityTarget,
  DataSource,
} from 'typeorm';
import { BaseRepositoryInterface } from './repository.interface';
import { PaginatedResult, PaginationQuery } from '@interfaces/pagination.interface';
import { PaginationUtil } from '@utils/pagination.util';
import { ResourceNotFoundException } from '@common/exceptions/custom-exceptions';

export abstract class BaseRepository<T> implements BaseRepositoryInterface<T> {
  protected repository: Repository<T>;

  constructor(
    private dataSource: DataSource,
    private entityTarget: EntityTarget<T>,
    private entityName: string,
  ) {
    this.repository = this.dataSource.getRepository(this.entityTarget);
  }

  create(data: DeepPartial<T>): T {
    return this.repository.create(data);
  }

  async save(entity: T): Promise<T> {
    return this.repository.save(entity);
  }

  async findById(id: string | number): Promise<T | null> {
    return this.repository.findOne({ where: { id } as any });
  }

  async findOne(options: FindOneOptions<T>): Promise<T | null> {
    return this.repository.findOne(options);
  }

  async findMany(options?: FindManyOptions<T>): Promise<T[]> {
    return this.repository.find(options);
  }

  async findAndCount(options?: FindManyOptions<T>): Promise<[T[], number]> {
    return this.repository.findAndCount(options);
  }

  async findPaginated(
    query: PaginationQuery,
    options: FindManyOptions<T> = {},
  ): Promise<PaginatedResult<T>> {
    const { page, limit, skip } = PaginationUtil.validateQuery(query);

    const findOptions: FindManyOptions<T> = {
      ...options,
      take: limit,
      skip,
    };

    const [data, total] = await this.repository.findAndCount(findOptions);

    return PaginationUtil.createResult(data, page, limit, total);
  }

  async update(id: string | number, data: DeepPartial<T>): Promise<T> {
    const entity = await this.findById(id);
    if (!entity) {
      throw new ResourceNotFoundException(this.entityName, id);
    }

    const updatedEntity = this.repository.merge(entity, data);
    return this.repository.save(updatedEntity);
  }

  async delete(id: string | number): Promise<void> {
    const result = await this.repository.delete(id);
    if (result.affected === 0) {
      throw new ResourceNotFoundException(this.entityName, id);
    }
  }

  async softDelete(id: string | number): Promise<void> {
    const result = await this.repository.softDelete(id);
    if (result.affected === 0) {
      throw new ResourceNotFoundException(this.entityName, id);
    }
  }

  async restore(id: string | number): Promise<void> {
    const result = await this.repository.restore(id);
    if (result.affected === 0) {
      throw new ResourceNotFoundException(this.entityName, id);
    }
  }

  async count(options?: FindManyOptions<T>): Promise<number> {
    return this.repository.count(options);
  }
}