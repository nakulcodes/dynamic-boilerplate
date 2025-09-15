import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsPhoneNumber, ArrayMinSize, ArrayMaxSize } from 'class-validator';

export class BulkSmsDto {
  @ApiProperty({
    description: 'Array of recipient phone numbers',
    example: ['+1234567890', '+0987654321'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100) // Limit bulk operations
  @IsString({ each: true })
  @IsPhoneNumber(null, { each: true })
  readonly phoneNumbers: string[];

  @ApiProperty({
    description: 'Message content',
    example: 'Bulk message from our application!',
  })
  @IsString()
  readonly body: string;

  @ApiPropertyOptional({
    description: 'Sender phone number (optional, uses default if not provided)',
    example: '+1122334455',
  })
  @IsOptional()
  @IsString()
  @IsPhoneNumber()
  readonly from?: string;

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
    example: 'https://yourapp.com/webhooks/bulk-sms-status',
  })
  @IsOptional()
  @IsString()
  readonly statusCallback?: string;

  @ApiPropertyOptional({
    description: 'Batch ID for tracking this bulk operation',
    example: 'batch_123456789',
  })
  @IsOptional()
  @IsString()
  readonly batchId?: string;
}