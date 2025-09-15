import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  READ = 'READ',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  FAILED_LOGIN = 'FAILED_LOGIN',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  EMAIL_CHANGE = 'EMAIL_CHANGE',
  ROLE_CHANGE = 'ROLE_CHANGE',
  DATA_EXPORT = 'DATA_EXPORT',
  SENSITIVE_DATA_ACCESS = 'SENSITIVE_DATA_ACCESS',
  CONFIGURATION_CHANGE = 'CONFIGURATION_CHANGE',
  CUSTOM = 'CUSTOM',
}

export enum AuditLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

@Entity('audit_logs')
@Index(['userId', 'timestamp'])
@Index(['action', 'timestamp'])
@Index(['level', 'timestamp'])
@Index(['resourceType', 'resourceId'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  @Index()
  action: AuditAction;

  @Column({ type: 'varchar', length: 20 })
  level: AuditLevel;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index()
  userId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  username: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  resourceType: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index()
  resourceId: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  changes: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };

  @Column({ type: 'varchar', length: 45, nullable: true })
  @Index()
  ipAddress: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  method: string;

  @Column({ type: 'text', nullable: true })
  endpoint: string;

  @Column({ type: 'integer', nullable: true })
  statusCode: number;

  @Column({ type: 'integer', nullable: true })
  duration: number;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  sessionId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  correlationId: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'timestamp' })
  @Index()
  timestamp: Date;

  @Column({ type: 'boolean', default: false })
  @Index()
  archived: boolean;
}