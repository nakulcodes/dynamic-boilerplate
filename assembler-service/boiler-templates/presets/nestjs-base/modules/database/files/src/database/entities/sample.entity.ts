import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('sample_entities')
export class SampleEntity extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;
}