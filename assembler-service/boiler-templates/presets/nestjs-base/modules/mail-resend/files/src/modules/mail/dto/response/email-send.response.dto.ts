import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EmailSendResponseDto {
  @ApiProperty({
    description: 'Indicates if the email was sent successfully',
    example: true,
  })
  readonly success: boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'Email sent successfully',
  })
  readonly message: string;

  @ApiPropertyOptional({
    description: 'Unique identifier for the sent email (from email service)',
    example: 'resend_123456789',
  })
  readonly messageId?: string;

  @ApiPropertyOptional({
    description: 'Email service response data',
    example: { id: 'resend_123456789', to: ['user@example.com'] },
  })
  readonly serviceResponse?: any;

  @ApiProperty({
    description: 'Timestamp when the email was sent',
    example: '2025-09-15T22:30:00.000Z',
    format: 'date-time',
  })
  readonly sentAt: string;

  @ApiPropertyOptional({
    description: 'Estimated delivery time',
    example: '2025-09-15T22:30:05.000Z',
    format: 'date-time',
  })
  readonly estimatedDelivery?: string;

  @ApiPropertyOptional({
    description: 'Email metadata',
    example: {
      to: 'user@example.com',
      subject: 'Welcome to Our Platform',
      template: 'welcome',
      provider: 'resend'
    },
  })
  readonly metadata?: {
    to: string | string[];
    subject: string;
    template?: string;
    provider: string;
    priority?: string;
    [key: string]: any;
  };

  @ApiPropertyOptional({
    description: 'Tracking information if available',
    example: {
      trackingId: 'track_123456789',
      trackingUrl: 'https://resend.com/track/123456789'
    },
  })
  readonly tracking?: {
    trackingId: string;
    trackingUrl?: string;
  };
}