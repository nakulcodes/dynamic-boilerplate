import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationResponseDto } from './notification.response.dto';

export class BulkSmsResult {
  @ApiProperty({
    description: 'Phone number for this result',
    example: '+1234567890',
  })
  readonly phoneNumber: string;

  @ApiProperty({
    description: 'Whether the SMS was sent successfully',
    example: true,
  })
  readonly success: boolean;

  @ApiPropertyOptional({
    description: 'Message SID if successful',
    example: 'SM1234567890abcdef1234567890abcdef',
  })
  readonly sid?: string;

  @ApiPropertyOptional({
    description: 'Error message if failed',
    example: 'Invalid phone number format',
  })
  readonly error?: string;

  @ApiPropertyOptional({
    description: 'Error code if failed',
    example: '21211',
  })
  readonly errorCode?: string;

  @ApiProperty({
    description: 'Timestamp when this message was processed',
    example: '2025-09-15T22:30:00.000Z',
    format: 'date-time',
  })
  readonly processedAt: string;
}

export class BulkSmsResponseDto {
  @ApiProperty({
    description: 'Unique identifier for this bulk operation',
    example: 'bulk_123456789',
  })
  readonly batchId: string;

  @ApiProperty({
    description: 'Total number of phone numbers processed',
    example: 10,
  })
  readonly totalCount: number;

  @ApiProperty({
    description: 'Number of messages sent successfully',
    example: 8,
  })
  readonly successCount: number;

  @ApiProperty({
    description: 'Number of messages that failed',
    example: 2,
  })
  readonly failureCount: number;

  @ApiProperty({
    description: 'Detailed results for each phone number',
    type: [BulkSmsResult],
  })
  readonly results: BulkSmsResult[];

  @ApiProperty({
    description: 'Overall success rate as percentage',
    example: 80,
  })
  readonly successRate: number;

  @ApiProperty({
    description: 'Timestamp when the bulk operation was initiated',
    example: '2025-09-15T22:30:00.000Z',
    format: 'date-time',
  })
  readonly initiatedAt: string;

  @ApiProperty({
    description: 'Timestamp when the bulk operation was completed',
    example: '2025-09-15T22:30:30.000Z',
    format: 'date-time',
  })
  readonly completedAt: string;

  @ApiPropertyOptional({
    description: 'Total cost of the bulk operation',
    example: '0.060',
  })
  readonly totalCost?: string;

  @ApiPropertyOptional({
    description: 'Currency unit for the cost',
    example: 'USD',
  })
  readonly costUnit?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata about the bulk operation',
    example: { priority: 'normal', source: 'marketing_campaign' },
  })
  readonly metadata?: Record<string, any>;
}