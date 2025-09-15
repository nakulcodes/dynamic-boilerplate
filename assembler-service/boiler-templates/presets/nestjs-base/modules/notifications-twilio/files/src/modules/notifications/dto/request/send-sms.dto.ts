import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsPhoneNumber } from 'class-validator';

export class SendSmsDto {
  @ApiProperty({
    description: 'Recipient phone number (with country code)',
    example: '+1234567890',
  })
  @IsString()
  @IsPhoneNumber()
  readonly to: string;

  @ApiProperty({
    description: 'Message content',
    example: 'Hello from our application!',
  })
  @IsString()
  readonly body: string;

  @ApiPropertyOptional({
    description: 'Sender phone number (optional, uses default if not provided)',
    example: '+0987654321',
  })
  @IsOptional()
  @IsString()
  @IsPhoneNumber()
  readonly from?: string;

  @ApiPropertyOptional({
    description: 'Optional media URLs for MMS',
    example: ['https://example.com/image.jpg'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly mediaUrl?: string[];

  @ApiPropertyOptional({
    description: 'Message priority',
    example: 'normal',
    enum: ['low', 'normal', 'high'],
  })
  @IsOptional()
  @IsString()
  readonly priority?: 'low' | 'normal' | 'high';

  @ApiPropertyOptional({
    description: 'Webhook URL for delivery status callbacks',
    example: 'https://yourapp.com/webhooks/sms-status',
  })
  @IsOptional()
  @IsString()
  readonly statusCallback?: string;
}