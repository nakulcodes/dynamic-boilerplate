import { DeepPartial } from 'typeorm';

export interface IBaseRepository<T> {
  findById(id: string | number): Promise<T | null>;
  existsById(id: string | number): Promise<boolean>;
  createEntity(entityData: DeepPartial<T>): Promise<T>;
  updateEntity(id: string | number, updateData: DeepPartial<T>): Promise<T | null>;
  deleteEntity(id: string | number): Promise<boolean>;
  softDeleteEntity(id: string | number): Promise<boolean>;
  findWithDeleted(): Promise<T[]>;
  restoreEntity(id: string | number): Promise<boolean>;
}