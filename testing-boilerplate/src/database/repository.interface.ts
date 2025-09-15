import { DeepPartial, FindManyOptions, FindOneOptions } from 'typeorm';
import { PaginatedResult, PaginationQuery } from '@interfaces/pagination.interface';

export interface BaseRepositoryInterface<T> {
  create(data: DeepPartial<T>): T;
  save(entity: T): Promise<T>;
  findById(id: string | number): Promise<T | null>;
  findOne(options: FindOneOptions<T>): Promise<T | null>;
  findMany(options?: FindManyOptions<T>): Promise<T[]>;
  findAndCount(options?: FindManyOptions<T>): Promise<[T[], number]>;
  findPaginated(query: PaginationQuery, options?: FindManyOptions<T>): Promise<PaginatedResult<T>>;
  update(id: string | number, data: DeepPartial<T>): Promise<T>;
  delete(id: string | number): Promise<void>;
  softDelete(id: string | number): Promise<void>;
  restore(id: string | number): Promise<void>;
  count(options?: FindManyOptions<T>): Promise<number>;
}