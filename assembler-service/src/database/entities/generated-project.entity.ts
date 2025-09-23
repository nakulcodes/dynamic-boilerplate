import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';

@Entity('generated_projects')
export class GeneratedProject {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  projectName: string;

  @Column()
  preset: string;

  @Column('simple-array')
  modules: string[];

  @Column()
  author: string;

  @Column()
  @Index()
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  downloadUrl: string;

  @Column({ nullable: true })
  fileName: string;

  @Column({ default: 'completed' })
  status: string; // 'generating', 'completed', 'failed'

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}