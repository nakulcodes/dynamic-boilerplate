import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CallResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the call',
    example: 'CA1234567890abcdef1234567890abcdef',
  })
  readonly sid: string;

  @ApiProperty({
    description: 'Current status of the call',
    example: 'queued',
    enum: ['queued', 'ringing', 'in-progress', 'completed', 'busy', 'failed', 'no-answer', 'canceled'],
  })
  readonly status: string;

  @ApiProperty({
    description: 'Recipient phone number',
    example: '+1234567890',
  })
  readonly to: string;

  @ApiProperty({
    description: 'Caller phone number',
    example: '+0987654321',
  })
  readonly from: string;

  @ApiProperty({
    description: 'Direction of the call',
    example: 'outbound-api',
    enum: ['inbound', 'outbound-api', 'outbound-dial'],
  })
  readonly direction: string;

  @ApiProperty({
    description: 'Timestamp when the call was created',
    example: '2025-09-15T22:30:00.000Z',
    format: 'date-time',
  })
  readonly dateCreated: string;

  @ApiPropertyOptional({
    description: 'Timestamp when the call started',
    example: '2025-09-15T22:30:05.000Z',
    format: 'date-time',
  })
  readonly startTime?: string;

  @ApiPropertyOptional({
    description: 'Timestamp when the call ended',
    example: '2025-09-15T22:35:05.000Z',
    format: 'date-time',
  })
  readonly endTime?: string;

  @ApiPropertyOptional({
    description: 'Duration of the call in seconds',
    example: 300,
  })
  readonly duration?: number;

  @ApiPropertyOptional({
    description: 'Cost of the call',
    example: '0.015',
  })
  readonly price?: string;

  @ApiPropertyOptional({
    description: 'Currency unit for the price',
    example: 'USD',
  })
  readonly priceUnit?: string;

  @ApiPropertyOptional({
    description: 'Error code if the call failed',
    example: '30001',
  })
  readonly errorCode?: string;

  @ApiPropertyOptional({
    description: 'Error message if the call failed',
    example: 'No answer',
  })
  readonly errorMessage?: string;

  @ApiPropertyOptional({
    description: 'Caller ID name if available',
    example: 'John Doe',
  })
  readonly callerName?: string;

  @ApiPropertyOptional({
    description: 'Call quality score (1-5)',
    example: 4,
  })
  readonly qualityScore?: number;

  @ApiPropertyOptional({
    description: 'Additional call metadata',
    example: { recordingUrl: 'https://api.twilio.com/recordings/...' },
  })
  readonly metadata?: Record<string, any>;
}