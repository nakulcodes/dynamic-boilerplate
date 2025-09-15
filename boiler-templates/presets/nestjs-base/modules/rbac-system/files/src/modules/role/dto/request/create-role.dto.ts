import {
  IsString,
  IsArray,
  IsOptional,
  IsBoolean,
  IsNumber,
  MinLength,
  MaxLength,
  ArrayMinSize,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({
    description: 'Unique role name (lowercase, no spaces)',
    example: 'content_manager',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: 'Display name for the role',
    example: 'Content Manager',
    maxLength: 150,
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  displayName?: string;

  @ApiPropertyOptional({
    description: 'Role description',
    example: 'Manages content creation and publication',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'List of permissions assigned to this role',
    example: ['content:read', 'content:write', 'content:publish'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  permissions: string[];

  @ApiPropertyOptional({
    description: 'Role priority (higher number = higher priority)',
    example: 500,
    minimum: 1,
    maximum: 999,
    default: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(999)
  priority?: number;

  @ApiPropertyOptional({
    description: 'Whether the role is active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}