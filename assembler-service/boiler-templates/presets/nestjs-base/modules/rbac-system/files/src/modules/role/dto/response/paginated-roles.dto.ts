import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { RoleDto } from './role.dto';
import { PaginatedResponseDto, PaginationMetaDto } from '../../../../../../../common/dto/response/api-response.dto';

export class PaginatedRolesDto extends PaginatedResponseDto<RoleDto> {
  @ApiProperty({
    description: 'Array of roles for the current page',
    type: [RoleDto],
  })
  @Expose()
  @Type(() => RoleDto)
  payload: RoleDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMetaDto,
  })
  @Expose()
  @Type(() => PaginationMetaDto)
  meta: PaginationMetaDto;

  constructor(roles: RoleDto[], page: number, limit: number, total: number) {
    super(roles, page, limit, total);
  }
}