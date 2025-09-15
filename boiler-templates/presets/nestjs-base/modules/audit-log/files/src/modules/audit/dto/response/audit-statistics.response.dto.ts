import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuditAction, AuditLevel } from '@db/entities/audit-log.entity';

export class ActionStatisticsDto {
  @ApiProperty({
    description: 'Count of LOGIN actions',
    example: 500,
  })
  readonly [AuditAction.LOGIN]: number;

  @ApiProperty({
    description: 'Count of CREATE actions',
    example: 200,
  })
  readonly [AuditAction.CREATE]: number;

  @ApiProperty({
    description: 'Count of UPDATE actions',
    example: 150,
  })
  readonly [AuditAction.UPDATE]: number;

  @ApiProperty({
    description: 'Count of DELETE actions',
    example: 50,
  })
  readonly [AuditAction.DELETE]: number;

  @ApiProperty({
    description: 'Count of FAILED_LOGIN actions',
    example: 25,
  })
  readonly [AuditAction.FAILED_LOGIN]: number;

  // Additional actions can be added dynamically
  [key: string]: number;
}

export class LevelStatisticsDto {
  @ApiProperty({
    description: 'Count of LOW level events',
    example: 600,
  })
  readonly [AuditLevel.LOW]: number;

  @ApiProperty({
    description: 'Count of MEDIUM level events',
    example: 300,
  })
  readonly [AuditLevel.MEDIUM]: number;

  @ApiProperty({
    description: 'Count of HIGH level events',
    example: 80,
  })
  readonly [AuditLevel.HIGH]: number;

  @ApiProperty({
    description: 'Count of CRITICAL level events',
    example: 20,
  })
  readonly [AuditLevel.CRITICAL]: number;
}

export class TimelineStatisticsDto {
  @ApiProperty({
    description: 'Date for the statistics',
    example: '2025-09-15',
    format: 'date',
  })
  readonly date: string;

  @ApiProperty({
    description: 'Total count for this period',
    example: 150,
  })
  readonly count: number;

  @ApiPropertyOptional({
    description: 'Breakdown by action for this period',
    example: { LOGIN: 100, CREATE: 30, UPDATE: 15, DELETE: 5 },
  })
  readonly actionBreakdown?: Record<string, number>;

  @ApiPropertyOptional({
    description: 'Breakdown by level for this period',
    example: { LOW: 90, MEDIUM: 40, HIGH: 15, CRITICAL: 5 },
  })
  readonly levelBreakdown?: Record<string, number>;
}

export class UserStatisticsDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  readonly userId: string;

  @ApiPropertyOptional({
    description: 'Username',
    example: 'john_doe',
  })
  readonly username?: string;

  @ApiProperty({
    description: 'Total actions by this user',
    example: 45,
  })
  readonly totalActions: number;

  @ApiProperty({
    description: 'Most recent action timestamp',
    example: '2025-09-15T22:30:00.000Z',
    format: 'date-time',
  })
  readonly lastAction: string;

  @ApiProperty({
    description: 'Breakdown of actions by type',
    example: { LOGIN: 20, CREATE: 10, UPDATE: 10, DELETE: 5 },
  })
  readonly actionBreakdown: Record<string, number>;
}

export class AuditStatisticsResponseDto {
  @ApiProperty({
    description: 'Total number of audit logs',
    example: 1000,
  })
  readonly totalLogs: number;

  @ApiProperty({
    description: 'Statistics broken down by action type',
    type: ActionStatisticsDto,
  })
  readonly logsByAction: ActionStatisticsDto;

  @ApiProperty({
    description: 'Statistics broken down by severity level',
    type: LevelStatisticsDto,
  })
  readonly logsByLevel: LevelStatisticsDto;

  @ApiProperty({
    description: 'Number of unique users in the period',
    example: 25,
  })
  readonly uniqueUsers: number;

  @ApiProperty({
    description: 'Total number of failed authentication attempts',
    example: 10,
  })
  readonly failedAttempts: number;

  @ApiProperty({
    description: 'Date range for the statistics',
    example: {
      fromDate: '2025-01-01T00:00:00.000Z',
      toDate: '2025-12-31T23:59:59.999Z'
    },
  })
  readonly dateRange: {
    fromDate: string;
    toDate: string;
  };

  @ApiPropertyOptional({
    description: 'Timeline statistics (if requested)',
    type: [TimelineStatisticsDto],
  })
  readonly timeline?: TimelineStatisticsDto[];

  @ApiPropertyOptional({
    description: 'Top active users (if requested)',
    type: [UserStatisticsDto],
  })
  readonly topUsers?: UserStatisticsDto[];

  @ApiPropertyOptional({
    description: 'Most common IP addresses',
    example: [
      { ipAddress: '192.168.1.1', count: 150 },
      { ipAddress: '192.168.1.2', count: 120 }
    ],
  })
  readonly topIpAddresses?: Array<{ ipAddress: string; count: number }>;

  @ApiPropertyOptional({
    description: 'Most accessed resources',
    example: [
      { resourceType: 'User', count: 300 },
      { resourceType: 'Order', count: 200 }
    ],
  })
  readonly topResources?: Array<{ resourceType: string; count: number }>;

  @ApiProperty({
    description: 'Timestamp when statistics were generated',
    example: '2025-09-15T22:30:00.000Z',
    format: 'date-time',
  })
  readonly generatedAt: string;
}