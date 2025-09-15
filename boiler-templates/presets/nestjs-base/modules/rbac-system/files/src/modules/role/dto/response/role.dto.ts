import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class RoleDto {
  @ApiProperty({
    description: 'Role unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Unique role name',
    example: 'content_manager',
  })
  @Expose()
  name: string;

  @ApiPropertyOptional({
    description: 'Display name for the role',
    example: 'Content Manager',
  })
  @Expose()
  displayName?: string;

  @ApiPropertyOptional({
    description: 'Role description',
    example: 'Manages content creation and publication',
  })
  @Expose()
  description?: string;

  @ApiProperty({
    description: 'Whether the role is active',
    example: true,
  })
  @Expose()
  isActive: boolean;

  @ApiProperty({
    description: 'Whether the role is a system role',
    example: false,
  })
  @Expose()
  isSystem: boolean;

  @ApiProperty({
    description: 'Role priority (higher number = higher priority)',
    example: 500,
  })
  @Expose()
  priority: number;

  @ApiProperty({
    description: 'List of permissions assigned to this role',
    example: ['content:read', 'content:write', 'content:publish'],
    type: [String],
  })
  @Expose()
  permissions: string[];

  @ApiProperty({
    description: 'Role creation date',
    example: '2024-01-01T00:00:00Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Role last update date',
    example: '2024-01-01T00:00:00Z',
  })
  @Expose()
  updatedAt: Date;
}