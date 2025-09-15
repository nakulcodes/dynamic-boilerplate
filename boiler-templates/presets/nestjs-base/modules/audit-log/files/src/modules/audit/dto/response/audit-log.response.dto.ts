import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuditAction, AuditLevel } from '@db/entities/audit-log.entity';

export class AuditLogResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the audit log',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  readonly id: string;

  @ApiProperty({
    description: 'Action that was performed',
    enum: AuditAction,
    example: AuditAction.LOGIN,
  })
  readonly action: AuditAction;

  @ApiProperty({
    description: 'Severity level of the audit event',
    enum: AuditLevel,
    example: AuditLevel.MEDIUM,
  })
  readonly level: AuditLevel;

  @ApiPropertyOptional({
    description: 'ID of the user who performed the action',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  readonly userId?: string;

  @ApiPropertyOptional({
    description: 'Username of the user who performed the action',
    example: 'john_doe',
  })
  readonly username?: string;

  @ApiPropertyOptional({
    description: 'Type of resource that was affected',
    example: 'User',
  })
  readonly resourceType?: string;

  @ApiPropertyOptional({
    description: 'ID of the resource that was affected',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  readonly resourceId?: string;

  @ApiPropertyOptional({
    description: 'Human-readable description of the action',
    example: 'User successfully logged in',
  })
  readonly description?: string;

  @ApiPropertyOptional({
    description: 'Additional details about the action',
    example: { loginMethod: 'email', twoFactorUsed: true },
  })
  readonly details?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Changes made to the resource (before/after)',
    example: {
      before: { status: 'inactive' },
      after: { status: 'active' }
    },
  })
  readonly changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };

  @ApiPropertyOptional({
    description: 'IP address from which the action was performed',
    example: '192.168.1.1',
  })
  readonly ipAddress?: string;

  @ApiPropertyOptional({
    description: 'User agent string of the client',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  })
  readonly userAgent?: string;

  @ApiPropertyOptional({
    description: 'HTTP method used',
    example: 'POST',
  })
  readonly method?: string;

  @ApiPropertyOptional({
    description: 'API endpoint that was called',
    example: '/api/auth/login',
  })
  readonly endpoint?: string;

  @ApiPropertyOptional({
    description: 'HTTP status code returned',
    example: 200,
  })
  readonly statusCode?: number;

  @ApiPropertyOptional({
    description: 'Duration of the request in milliseconds',
    example: 150,
  })
  readonly duration?: number;

  @ApiPropertyOptional({
    description: 'Error message if the action failed',
    example: 'Invalid credentials provided',
  })
  readonly errorMessage?: string;

  @ApiPropertyOptional({
    description: 'Session ID associated with the action',
    example: 'sess_123456789',
  })
  readonly sessionId?: string;

  @ApiPropertyOptional({
    description: 'Correlation ID for tracking related actions',
    example: 'corr_123456789',
  })
  readonly correlationId?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata about the action',
    example: { requestId: 'req_123', source: 'web_app' },
  })
  readonly metadata?: Record<string, any>;

  @ApiProperty({
    description: 'Timestamp when the action occurred',
    example: '2025-09-15T22:30:00.000Z',
    format: 'date-time',
  })
  readonly timestamp: Date;

  @ApiProperty({
    description: 'Whether this log entry has been archived',
    example: false,
  })
  readonly archived: boolean;
}