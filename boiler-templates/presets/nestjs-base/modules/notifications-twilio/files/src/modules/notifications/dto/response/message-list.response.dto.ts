import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationResponseDto } from './notification.response.dto';

export class MessageListResponseDto {
  @ApiProperty({
    description: 'List of messages',
    type: [NotificationResponseDto],
  })
  readonly messages: NotificationResponseDto[];

  @ApiProperty({
    description: 'Total number of messages returned',
    example: 20,
  })
  readonly count: number;

  @ApiPropertyOptional({
    description: 'URI for the next page of results',
    example: '/messages?PageToken=abc123',
  })
  readonly nextPageUri?: string;

  @ApiPropertyOptional({
    description: 'URI for the previous page of results',
    example: '/messages?PageToken=xyz789',
  })
  readonly previousPageUri?: string;

  @ApiProperty({
    description: 'Filters applied to the message list',
    example: {
      to: '+1234567890',
      status: 'delivered',
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
      delivered: 15,
      failed: 2,
      pending: 3
    },
  })
  readonly summary?: Record<string, number>;
}