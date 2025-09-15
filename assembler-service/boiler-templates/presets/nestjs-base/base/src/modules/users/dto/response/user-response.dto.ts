import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ApiResponseDto, PaginatedResponseDto, ResponseMetaDto, PaginationMetaDto } from '@common/dto';

export class UserDto {
  @ApiProperty({
    description: 'User unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @Expose()
  email: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  @Expose()
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  @Expose()
  lastName: string;

  @ApiProperty({
    description: 'Whether the user is active',
    example: true,
  })
  @Expose()
  isActive: boolean;

  @ApiProperty({
    description: 'User creation date',
    example: '2024-01-01T00:00:00Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'User last update date',
    example: '2024-01-01T00:00:00Z',
  })
  @Expose()
  updatedAt: Date;
}

/**
 * Single user response DTO following the standardized format
 * Example response: { payload: UserDto, meta: { timestamp: "..." } }
 */
export class UserResponseDto extends ApiResponseDto<UserDto> {
  @ApiProperty({
    description: 'User data',
    type: UserDto,
  })
  @Expose()
  @Type(() => UserDto)
  payload: UserDto;

  @ApiProperty({
    description: 'Response metadata',
    type: ResponseMetaDto,
  })
  @Expose()
  @Type(() => ResponseMetaDto)
  meta?: ResponseMetaDto;

  constructor(user: UserDto, meta?: Record<string, any>) {
    super(user, meta || new ResponseMetaDto());
  }
}

/**
 * Paginated users response DTO following the standardized format
 * Example response: { payload: UserDto[], meta: { page: 1, limit: 50, total: 100 } }
 */
export class PaginatedUsersResponseDto extends PaginatedResponseDto<UserDto> {
  @ApiProperty({
    description: 'Array of users for the current page',
    type: [UserDto],
  })
  @Expose()
  @Type(() => UserDto)
  payload: UserDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMetaDto,
  })
  @Expose()
  @Type(() => PaginationMetaDto)
  meta: PaginationMetaDto;

  constructor(users: UserDto[], page: number, limit: number, total: number) {
    super(users, page, limit, total);
  }
}