import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NotificationResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the message/call',
    example: 'SM1234567890abcdef1234567890abcdef',
  })
  readonly sid: string;

  @ApiProperty({
    description: 'Current status of the notification',
    example: 'queued',
    enum: ['queued', 'sending', 'sent', 'failed', 'delivered', 'undelivered', 'receiving', 'received'],
  })
  readonly status: string;

  @ApiProperty({
    description: 'Recipient phone number',
    example: '+1234567890',
  })
  readonly to: string;

  @ApiProperty({
    description: 'Sender phone number',
    example: '+0987654321',
  })
  readonly from: string;

  @ApiPropertyOptional({
    description: 'Message body (for SMS/WhatsApp)',
    example: 'Hello from our application!',
  })
  readonly body?: string;

  @ApiProperty({
    description: 'Direction of the communication',
    example: 'outbound-api',
    enum: ['inbound', 'outbound-api', 'outbound-dial'],
  })
  readonly direction: string;

  @ApiProperty({
    description: 'Timestamp when the notification was created',
    example: '2025-09-15T22:30:00.000Z',
    format: 'date-time',
  })
  readonly dateCreated: string;

  @ApiPropertyOptional({
    description: 'Timestamp when the notification was sent',
    example: '2025-09-15T22:30:05.000Z',
    format: 'date-time',
  })
  readonly dateSent?: string;

  @ApiPropertyOptional({
    description: 'Cost of the notification',
    example: '0.0075',
  })
  readonly price?: string;

  @ApiPropertyOptional({
    description: 'Currency unit for the price',
    example: 'USD',
  })
  readonly priceUnit?: string;

  @ApiPropertyOptional({
    description: 'Error code if the notification failed',
    example: '30001',
  })
  readonly errorCode?: string;

  @ApiPropertyOptional({
    description: 'Error message if the notification failed',
    example: 'Queue overflow',
  })
  readonly errorMessage?: string;

  @ApiPropertyOptional({
    description: 'Number of media files attached (for MMS)',
    example: 1,
  })
  readonly numMedia?: number;

  @ApiPropertyOptional({
    description: 'Type of notification',
    example: 'sms',
    enum: ['sms', 'whatsapp', 'call'],
  })
  readonly type?: 'sms' | 'whatsapp' | 'call';

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: { batchId: 'batch_123', priority: 'normal' },
  })
  readonly metadata?: Record<string, any>;
}