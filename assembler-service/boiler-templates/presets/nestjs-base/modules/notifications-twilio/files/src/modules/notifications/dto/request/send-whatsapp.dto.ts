import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsPhoneNumber } from 'class-validator';

export class SendWhatsAppDto {
  @ApiProperty({
    description: 'Recipient WhatsApp number (with country code)',
    example: '+1234567890',
  })
  @IsString()
  @IsPhoneNumber()
  readonly to: string;

  @ApiProperty({
    description: 'Message content',
    example: 'Hello from our application via WhatsApp!',
  })
  @IsString()
  readonly body: string;

  @ApiPropertyOptional({
    description: 'Sender WhatsApp number (optional, uses default if not provided)',
    example: '+0987654321',
  })
  @IsOptional()
  @IsString()
  @IsPhoneNumber()
  readonly from?: string;

  @ApiPropertyOptional({
    description: 'Optional media URLs for WhatsApp media messages',
    example: ['https://example.com/document.pdf'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly mediaUrl?: string[];

  @ApiPropertyOptional({
    description: 'WhatsApp template name for template messages',
    example: 'hello_world',
  })
  @IsOptional()
  @IsString()
  readonly templateName?: string;

  @ApiPropertyOptional({
    description: 'Template parameters for WhatsApp template messages',
    example: ['John', 'Doe'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly templateParameters?: string[];

  @ApiPropertyOptional({
    description: 'Webhook URL for delivery status callbacks',
    example: 'https://yourapp.com/webhooks/whatsapp-status',
  })
  @IsOptional()
  @IsString()
  readonly statusCallback?: string;
}