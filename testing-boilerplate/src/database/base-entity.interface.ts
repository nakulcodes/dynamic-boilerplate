export interface BaseEntity {
  id: string | number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface EntityWithTimestamps {
  createdAt: Date;
  updatedAt: Date;
}

export interface SoftDeleteEntity extends EntityWithTimestamps {
  deletedAt?: Date;
}