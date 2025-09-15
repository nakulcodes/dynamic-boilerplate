import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PhoneValidationResponseDto {
  @ApiProperty({
    description: 'Original phone number provided',
    example: '+1234567890',
  })
  readonly phoneNumber: string;

  @ApiProperty({
    description: 'Whether the phone number is valid',
    example: true,
  })
  readonly isValid: boolean;

  @ApiProperty({
    description: 'Formatted phone number in E.164 format',
    example: '+1234567890',
  })
  readonly formatted: string;

  @ApiPropertyOptional({
    description: 'Country code detected',
    example: 'US',
  })
  readonly countryCode?: string;

  @ApiPropertyOptional({
    description: 'Country name',
    example: 'United States',
  })
  readonly countryName?: string;

  @ApiPropertyOptional({
    description: 'Phone number type',
    example: 'mobile',
    enum: ['landline', 'mobile', 'voip', 'unknown'],
  })
  readonly type?: 'landline' | 'mobile' | 'voip' | 'unknown';

  @ApiPropertyOptional({
    description: 'Carrier information if available',
    example: 'Verizon Wireless',
  })
  readonly carrier?: string;

  @ApiPropertyOptional({
    description: 'Whether the number can receive SMS',
    example: true,
  })
  readonly smsCapable?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the number can receive voice calls',
    example: true,
  })
  readonly voiceCapable?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the number supports WhatsApp',
    example: true,
  })
  readonly whatsappCapable?: boolean;

  @ApiProperty({
    description: 'Validation timestamp',
    example: '2025-09-15T22:30:00.000Z',
    format: 'date-time',
  })
  readonly validatedAt: string;

  @ApiPropertyOptional({
    description: 'Validation errors if any',
    example: ['Invalid country code', 'Number too short'],
    type: [String],
  })
  readonly errors?: string[];

  @ApiPropertyOptional({
    description: 'Additional validation metadata',
    example: { confidence: 0.95, source: 'twilio_lookup' },
  })
  readonly metadata?: Record<string, any>;
}