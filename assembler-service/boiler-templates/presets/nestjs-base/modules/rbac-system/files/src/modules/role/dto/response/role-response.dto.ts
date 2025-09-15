import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { RoleDto } from './role.dto';
import { ApiResponseDto, ResponseMetaDto } from '../../../../../../../common/dto/response/api-response.dto';

export class RoleResponseDto extends ApiResponseDto<RoleDto> {
  @ApiProperty({
    description: 'Role data',
    type: RoleDto,
  })
  @Expose()
  @Type(() => RoleDto)
  payload: RoleDto;

  @ApiProperty({
    description: 'Response metadata',
    type: ResponseMetaDto,
  })
  @Expose()
  @Type(() => ResponseMetaDto)
  meta?: ResponseMetaDto;

  constructor(role: RoleDto, meta?: Record<string, any>) {
    super(role, meta || new ResponseMetaDto());
  }
}