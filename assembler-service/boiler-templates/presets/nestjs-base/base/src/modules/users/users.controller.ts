import {
  Controller,
  Get,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
  ParseUUIDPipe
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { UserResponseDto, PaginatedUsersResponseDto } from './dto/response/user-response.dto';
import { PaginationDto, ResponseFactory } from '@common/dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of users',
    type: PaginatedUsersResponseDto
  })
  async findAll(
    @Query() paginationDto: PaginationDto
  ): Promise<PaginatedUsersResponseDto> {
    const { page = 1, limit = 50 } = paginationDto;
    const { users, total } = await this.usersService.findAll(page, limit);

    return new PaginatedUsersResponseDto(users, page, limit, total);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User details',
    type: UserResponseDto
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<UserResponseDto> {
    const user = await this.usersService.findOne(id);
    return new UserResponseDto(user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
    schema: {
      type: 'object',
      properties: {
        payload: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'User deleted successfully' },
            deletedId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' }
          }
        },
        meta: {
          type: 'object',
          properties: {
            timestamp: { type: 'string', example: '2025-09-16T10:00:00.000Z' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.usersService.remove(id);

    return ResponseFactory.success({
      message: 'User deleted successfully',
      deletedId: id
    });
  }
}