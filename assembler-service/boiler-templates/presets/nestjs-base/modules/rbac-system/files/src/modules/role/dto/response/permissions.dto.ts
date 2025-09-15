import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ApiResponseDto, ResponseMetaDto } from '../../../../../../../common/dto/response/api-response.dto';

export class PermissionDto {
  @ApiProperty({
    description: 'Permission string',
    example: 'content:read',
  })
  @Expose()
  permission: string;

  @ApiProperty({
    description: 'Resource name',
    example: 'content',
  })
  @Expose()
  resource: string;

  @ApiProperty({
    description: 'Action name',
    example: 'read',
  })
  @Expose()
  action: string;

  @ApiProperty({
    description: 'Human-readable description',
    example: 'View content',
  })
  @Expose()
  description: string;
}

export class PermissionsListDto {
  @ApiProperty({
    description: 'List of all available permissions',
    type: [String],
    example: ['content:read', 'content:write', 'users:read'],
  })
  permissions: string[];
}

export class PermissionsResponseDto extends ApiResponseDto<PermissionsListDto> {
  @ApiProperty({
    description: 'Permissions data',
    type: PermissionsListDto,
  })
  @Expose()
  @Type(() => PermissionsListDto)
  payload: PermissionsListDto;

  @ApiProperty({
    description: 'Response metadata',
    type: ResponseMetaDto,
  })
  @Expose()
  @Type(() => ResponseMetaDto)
  meta?: ResponseMetaDto;

  constructor(permissions: string[], meta?: Record<string, any>) {
    const permissionsData = { permissions };
    super(permissionsData, meta || new ResponseMetaDto());
  }
}