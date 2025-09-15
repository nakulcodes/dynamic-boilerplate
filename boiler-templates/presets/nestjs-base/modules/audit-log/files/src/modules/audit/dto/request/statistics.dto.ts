import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { DateRangeDto } from '@common/dto';
import { AuditAction, AuditLevel } from '@db/entities/audit-log.entity';

export class StatisticsDto extends DateRangeDto {
  @ApiPropertyOptional({
    description: 'Group statistics by this field',
    enum: ['action', 'level', 'user', 'resourceType', 'hour', 'day'],
    example: 'action',
  })
  @IsOptional()
  @IsEnum(['action', 'level', 'user', 'resourceType', 'hour', 'day'])
  readonly groupBy?: 'action' | 'level' | 'user' | 'resourceType' | 'hour' | 'day';

  @ApiPropertyOptional({
    description: 'Filter statistics by specific action',
    enum: AuditAction,
    example: AuditAction.LOGIN,
  })
  @IsOptional()
  @IsEnum(AuditAction)
  readonly action?: AuditAction;

  @ApiPropertyOptional({
    description: 'Filter statistics by specific level',
    enum: AuditLevel,
    example: AuditLevel.HIGH,
  })
  @IsOptional()
  @IsEnum(AuditLevel)
  readonly level?: AuditLevel;

  @ApiPropertyOptional({
    description: 'Filter statistics by user ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  readonly userId?: string;

  @ApiPropertyOptional({
    description: 'Include breakdown by time periods',
    example: true,
  })
  @IsOptional()
  readonly includeTimeline?: boolean;
}