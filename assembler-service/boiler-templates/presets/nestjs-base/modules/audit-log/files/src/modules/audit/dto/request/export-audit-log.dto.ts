import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsBoolean, IsIP } from 'class-validator';
import { Transform } from 'class-transformer';
import { AuditAction, AuditLevel } from '@db/entities/audit-log.entity';

export class ExportAuditLogDto {
  @ApiPropertyOptional({
    description: 'Export format',
    enum: ['json', 'csv'],
    example: 'json',
    default: 'json',
  })
  @IsOptional()
  @IsEnum(['json', 'csv'])
  readonly format?: 'json' | 'csv' = 'json';

  @ApiPropertyOptional({
    description: 'Filter by user ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  readonly userId?: string;

  @ApiPropertyOptional({
    description: 'Filter by audit action',
    enum: AuditAction,
    example: AuditAction.LOGIN,
  })
  @IsOptional()
  @IsEnum(AuditAction)
  readonly action?: AuditAction;

  @ApiPropertyOptional({
    description: 'Filter by audit level',
    enum: AuditLevel,
    example: AuditLevel.MEDIUM,
  })
  @IsOptional()
  @IsEnum(AuditLevel)
  readonly level?: AuditLevel;

  @ApiPropertyOptional({
    description: 'Filter by resource type',
    example: 'User',
  })
  @IsOptional()
  @IsString()
  readonly resourceType?: string;

  @ApiPropertyOptional({
    description: 'Filter by resource ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  readonly resourceId?: string;

  @ApiPropertyOptional({
    description: 'Start date for filtering (ISO 8601 format)',
    example: '2025-01-01T00:00:00.000Z',
    format: 'date-time',
  })
  @IsOptional()
  @IsString()
  readonly fromDate?: string;

  @ApiPropertyOptional({
    description: 'End date for filtering (ISO 8601 format)',
    example: '2025-12-31T23:59:59.999Z',
    format: 'date-time',
  })
  @IsOptional()
  @IsString()
  readonly toDate?: string;

  @ApiPropertyOptional({
    description: 'Filter by IP address',
    example: '192.168.1.1',
  })
  @IsOptional()
  @IsIP()
  readonly ipAddress?: string;

  @ApiPropertyOptional({
    description: 'Filter by archived status',
    example: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  readonly archived?: boolean;

  @ApiPropertyOptional({
    description: 'Include sensitive data in export',
    example: false,
    default: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  readonly includeSensitiveData?: boolean = false;

  @ApiPropertyOptional({
    description: 'Maximum number of records to export',
    example: 10000,
  })
  @IsOptional()
  @Transform(({ value }) => value ? parseInt(value, 10) : undefined)
  readonly maxRecords?: number;
}