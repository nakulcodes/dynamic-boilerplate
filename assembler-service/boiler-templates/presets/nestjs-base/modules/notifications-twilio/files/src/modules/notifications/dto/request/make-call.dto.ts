import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsPhoneNumber, IsUrl, ValidateIf } from 'class-validator';

export class MakeCallDto {
  @ApiProperty({
    description: 'Recipient phone number (with country code)',
    example: '+1234567890',
  })
  @IsString()
  @IsPhoneNumber()
  readonly to: string;

  @ApiPropertyOptional({
    description: 'Caller phone number (optional, uses default if not provided)',
    example: '+0987654321',
  })
  @IsOptional()
  @IsString()
  @IsPhoneNumber()
  readonly from?: string;

  @ApiPropertyOptional({
    description: 'URL to TwiML instructions (mutually exclusive with twiml)',
    example: 'https://example.com/voice.xml',
  })
  @IsOptional()
  @ValidateIf(o => !o.twiml)
  @IsUrl()
  readonly url?: string;

  @ApiPropertyOptional({
    description: 'TwiML instructions (mutually exclusive with url)',
    example: '<Response><Say>Hello, this is a test call.</Say></Response>',
  })
  @IsOptional()
  @ValidateIf(o => !o.url)
  @IsString()
  readonly twiml?: string;

  @ApiPropertyOptional({
    description: 'Timeout in seconds for the call to be answered',
    example: 30,
  })
  @IsOptional()
  @IsString()
  readonly timeout?: string;

  @ApiPropertyOptional({
    description: 'Maximum call duration in seconds',
    example: 300,
  })
  @IsOptional()
  @IsString()
  readonly timeLimit?: string;

  @ApiPropertyOptional({
    description: 'Webhook URL for call status callbacks',
    example: 'https://yourapp.com/webhooks/call-status',
  })
  @IsOptional()
  @IsUrl()
  readonly statusCallback?: string;

  @ApiPropertyOptional({
    description: 'Webhook URL for call events',
    example: 'https://yourapp.com/webhooks/call-events',
  })
  @IsOptional()
  @IsUrl()
  readonly statusCallbackEvent?: string;

  @ApiPropertyOptional({
    description: 'HTTP method for status callback',
    example: 'POST',
    enum: ['GET', 'POST'],
  })
  @IsOptional()
  @IsString()
  readonly statusCallbackMethod?: 'GET' | 'POST';
}