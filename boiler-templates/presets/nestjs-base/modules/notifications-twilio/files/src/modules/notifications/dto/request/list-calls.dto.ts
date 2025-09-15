import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class ListCallsDto {
  @ApiPropertyOptional({
    description: 'Maximum number of calls to return',
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
    description: 'Filter calls made to this phone number',
    example: '+1234567890',
  })
  @IsOptional()
  @IsString()
  readonly to?: string;

  @ApiPropertyOptional({
    description: 'Filter calls made from this phone number',
    example: '+0987654321',
  })
  @IsOptional()
  @IsString()
  readonly from?: string;

  @ApiPropertyOptional({
    description: 'Filter calls by status',
    example: 'completed',
    enum: ['queued', 'ringing', 'in-progress', 'completed', 'busy', 'failed', 'no-answer', 'canceled'],
  })
  @IsOptional()
  @IsString()
  readonly status?: string;

  @ApiPropertyOptional({
    description: 'Filter calls started on or after this date (ISO 8601)',
    example: '2025-09-15T00:00:00.000Z',
    format: 'date-time',
  })
  @IsOptional()
  @IsString()
  readonly startTimeAfter?: string;

  @ApiPropertyOptional({
    description: 'Filter calls started on or before this date (ISO 8601)',
    example: '2025-09-15T23:59:59.999Z',
    format: 'date-time',
  })
  @IsOptional()
  @IsString()
  readonly startTimeBefore?: string;

  @ApiPropertyOptional({
    description: 'Filter calls by direction',
    example: 'outbound-api',
    enum: ['inbound', 'outbound-api', 'outbound-dial'],
  })
  @IsOptional()
  @IsString()
  readonly direction?: string;
}