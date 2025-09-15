import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsISO8601 } from 'class-validator';
import { Transform } from 'class-transformer';

export class DateRangeDto {
  @ApiPropertyOptional({
    description: 'Start date for filtering (ISO 8601 format)',
    example: '2025-01-01T00:00:00.000Z',
    format: 'date-time',
  })
  @IsOptional()
  @IsISO8601()
  @Transform(({ value }) => value ? new Date(value).toISOString() : undefined)
  readonly fromDate?: string;

  @ApiPropertyOptional({
    description: 'End date for filtering (ISO 8601 format)',
    example: '2025-12-31T23:59:59.999Z',
    format: 'date-time',
  })
  @IsOptional()
  @IsISO8601()
  @Transform(({ value }) => value ? new Date(value).toISOString() : undefined)
  readonly toDate?: string;
}

export class SimpleDateRangeDto {
  @ApiPropertyOptional({
    description: 'Start date for filtering (YYYY-MM-DD format)',
    example: '2025-01-01',
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  readonly fromDate?: string;

  @ApiPropertyOptional({
    description: 'End date for filtering (YYYY-MM-DD format)',
    example: '2025-12-31',
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  readonly toDate?: string;
}