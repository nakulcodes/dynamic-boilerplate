import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsIP, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class BaseFilterDto {
  @ApiPropertyOptional({
    description: 'Search term for text-based filtering',
    example: 'search term',
  })
  @IsOptional()
  @IsString()
  readonly search?: string;

  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  readonly isActive?: boolean;

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
}

export class UserFilterDto extends BaseFilterDto {
  @ApiPropertyOptional({
    description: 'Filter by user ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID(4)
  readonly userId?: string;

  @ApiPropertyOptional({
    description: 'Filter by username',
    example: 'john_doe',
  })
  @IsOptional()
  @IsString()
  readonly username?: string;

  @ApiPropertyOptional({
    description: 'Filter by email',
    example: 'user@example.com',
  })
  @IsOptional()
  @IsString()
  readonly email?: string;
}

export class IPFilterDto {
  @ApiPropertyOptional({
    description: 'Filter by IP address',
    example: '192.168.1.1',
  })
  @IsOptional()
  @IsIP()
  readonly ipAddress?: string;
}

export class ResourceFilterDto {
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
}