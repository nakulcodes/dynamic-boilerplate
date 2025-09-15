import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { DateRangeDto } from '@common/dto';

export class CriticalEventsDto extends DateRangeDto {
  @ApiPropertyOptional({
    description: 'Filter by specific user ID for critical events',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  readonly userId?: string;

  @ApiPropertyOptional({
    description: 'Filter by IP address for critical events',
    example: '192.168.1.1',
  })
  @IsOptional()
  @IsString()
  readonly ipAddress?: string;

  @ApiPropertyOptional({
    description: 'Filter by resource type for critical events',
    example: 'User',
  })
  @IsOptional()
  @IsString()
  readonly resourceType?: string;
}