import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class FailedAttemptsDto {
  @ApiPropertyOptional({
    description: 'Filter by user ID for failed attempts',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  readonly userId?: string;

  @ApiPropertyOptional({
    description: 'Start date for filtering failed attempts',
    example: '2025-01-01T00:00:00.000Z',
    format: 'date-time',
  })
  @IsOptional()
  @IsString()
  readonly fromDate?: string;

  @ApiPropertyOptional({
    description: 'Maximum number of records to return',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  readonly limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Filter by IP address for failed attempts',
    example: '192.168.1.1',
  })
  @IsOptional()
  @IsString()
  readonly ipAddress?: string;

  @ApiPropertyOptional({
    description: 'Filter by username for failed attempts',
    example: 'john_doe',
  })
  @IsOptional()
  @IsString()
  readonly username?: string;
}