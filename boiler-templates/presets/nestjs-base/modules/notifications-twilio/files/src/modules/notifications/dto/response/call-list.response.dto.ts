import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CallResponseDto } from './call.response.dto';

export class CallListResponseDto {
  @ApiProperty({
    description: 'List of calls',
    type: [CallResponseDto],
  })
  readonly calls: CallResponseDto[];

  @ApiProperty({
    description: 'Total number of calls returned',
    example: 20,
  })
  readonly count: number;

  @ApiPropertyOptional({
    description: 'URI for the next page of results',
    example: '/calls?PageToken=abc123',
  })
  readonly nextPageUri?: string;

  @ApiPropertyOptional({
    description: 'URI for the previous page of results',
    example: '/calls?PageToken=xyz789',
  })
  readonly previousPageUri?: string;

  @ApiProperty({
    description: 'Filters applied to the call list',
    example: {
      to: '+1234567890',
      status: 'completed',
      limit: 20
    },
  })
  readonly filters: Record<string, any>;

  @ApiProperty({
    description: 'Timestamp when the list was retrieved',
    example: '2025-09-15T22:30:00.000Z',
    format: 'date-time',
  })
  readonly retrievedAt: string;

  @ApiPropertyOptional({
    description: 'Summary statistics',
    example: {
      completed: 15,
      failed: 2,
      'no-answer': 3
    },
  })
  readonly summary?: Record<string, number>;

  @ApiPropertyOptional({
    description: 'Total call duration in seconds',
    example: 4500,
  })
  readonly totalDuration?: number;

  @ApiPropertyOptional({
    description: 'Total cost of all calls',
    example: '2.45',
  })
  readonly totalCost?: string;
}