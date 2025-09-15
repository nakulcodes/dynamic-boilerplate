import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class ListMessagesDto {
  @ApiPropertyOptional({
    description: 'Maximum number of messages to return',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  readonly limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Filter messages sent to this phone number',
    example: '+1234567890',
  })
  @IsOptional()
  @IsString()
  readonly to?: string;

  @ApiPropertyOptional({
    description: 'Filter messages sent from this phone number',
    example: '+0987654321',
  })
  @IsOptional()
  @IsString()
  readonly from?: string;

  @ApiPropertyOptional({
    description: 'Filter messages by status',
    example: 'delivered',
    enum: ['queued', 'sending', 'sent', 'failed', 'delivered', 'undelivered', 'receiving', 'received'],
  })
  @IsOptional()
  @IsString()
  readonly status?: string;

  @ApiPropertyOptional({
    description: 'Filter messages sent on or after this date (ISO 8601)',
    example: '2025-09-15T00:00:00.000Z',
    format: 'date-time',
  })
  @IsOptional()
  @IsString()
  readonly dateSentAfter?: string;

  @ApiPropertyOptional({
    description: 'Filter messages sent on or before this date (ISO 8601)',
    example: '2025-09-15T23:59:59.999Z',
    format: 'date-time',
  })
  @IsOptional()
  @IsString()
  readonly dateSentBefore?: string;
}