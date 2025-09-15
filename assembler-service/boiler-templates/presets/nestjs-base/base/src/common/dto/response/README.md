# Standardized API Response Format

This directory contains the standardized response DTOs and interfaces for the boilerplate system. All API responses should follow the new `payload/meta` structure for consistency.

## 🔄 Response Format Structure

### Single Item Response
```json
{
  "payload": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Example Item",
    "description": "This is an example"
  },
  "meta": {
    "timestamp": "2025-09-16T10:00:00.000Z"
  }
}
```

### Paginated List Response
```json
{
  "payload": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Item 1"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Item 2"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "totalPages": 2,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

## 📚 Available Classes and Interfaces

### Interfaces
- `ApiResponse<T>` - Generic interface for single item responses
- `PaginatedApiResponse<T>` - Generic interface for paginated responses
- `PaginationMetaData` - Interface for pagination metadata
- `ResponseMetaData` - Interface for general response metadata

### DTOs
- `ApiResponseDto<T>` - Base DTO class for single responses
- `PaginatedResponseDto<T>` - Base DTO class for paginated responses
- `PaginationMetaDto` - DTO for pagination metadata
- `ResponseMetaDto` - DTO for general response metadata
- `ResponseFactory` - Helper class for creating responses

## 🚀 Quick Start

### 1. Create a Custom Response DTO

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ApiResponseDto, ResponseMetaDto } from '@common/dto';

export class UserDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  email: string;

  // ... other properties
}

export class UserResponseDto extends ApiResponseDto<UserDto> {
  @ApiProperty({ type: UserDto })
  @Expose()
  @Type(() => UserDto)
  payload: UserDto;

  @ApiProperty({ type: ResponseMetaDto })
  @Expose()
  @Type(() => ResponseMetaDto)
  meta?: ResponseMetaDto;

  constructor(user: UserDto, meta?: Record<string, any>) {
    super(user, meta || new ResponseMetaDto());
  }
}
```

### 2. Use in Controller

```typescript
import { Controller, Get, Param } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { UserResponseDto } from './dto/response/user-response.dto';
import { ResponseFactory } from '@common/dto';

@Controller('users')
export class UsersController {
  @Get(':id')
  @ApiResponse({ status: 200, type: UserResponseDto })
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.usersService.findOne(id);
    return new UserResponseDto(user);
  }

  // Using ResponseFactory for quick responses
  @Get('simple-example')
  async simpleExample() {
    const data = { message: 'Hello World' };
    return ResponseFactory.success(data);
  }
}
```

### 3. Paginated Responses

```typescript
import { PaginatedResponseDto, PaginationDto } from '@common/dto';

export class PaginatedUsersResponseDto extends PaginatedResponseDto<UserDto> {
  @ApiProperty({ type: [UserDto] })
  payload: UserDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;

  constructor(users: UserDto[], page: number, limit: number, total: number) {
    super(users, page, limit, total);
  }
}

// In controller:
@Get()
@ApiResponse({ status: 200, type: PaginatedUsersResponseDto })
async findAll(@Query() paginationDto: PaginationDto): Promise<PaginatedUsersResponseDto> {
  const { page = 1, limit = 50 } = paginationDto;
  const { users, total } = await this.usersService.findAll(page, limit);
  return new PaginatedUsersResponseDto(users, page, limit, total);
}
```

## 🔧 ResponseFactory Helper Methods

```typescript
// Single item response
ResponseFactory.success(data, { timestamp: '...' });

// Paginated response
ResponseFactory.paginated(items, page, limit, total);

// Empty paginated response
ResponseFactory.emptyPaginated(page, limit);
```

## 🏗️ Migration from Legacy Format

### Old Format (Deprecated)
```typescript
// ❌ Old way - don't use this
export class LegacyUserResponse {
  success: boolean;
  message: string;
  data: UserDto;
  timestamp: string;
}
```

### New Format (Recommended)
```typescript
// ✅ New way - use this
export class UserResponseDto extends ApiResponseDto<UserDto> {
  payload: UserDto;
  meta?: ResponseMetaDto;
}
```

## 📖 Best Practices

1. **Always extend base classes**: Use `ApiResponseDto<T>` or `PaginatedResponseDto<T>`
2. **Include proper TypeScript generics**: This ensures type safety
3. **Use Swagger decorators**: Document your responses with `@ApiProperty`
4. **Consistent naming**: Use `*ResponseDto` for single items, `Paginated*ResponseDto` for lists
5. **Leverage ResponseFactory**: For quick responses without custom DTOs

## 🔍 Error Handling

Error responses continue to use the standard NestJS format and don't need to follow the payload/meta structure:

```json
{
  "success": false,
  "message": "Validation failed",
  "statusCode": 400,
  "timestamp": "2025-09-16T10:00:00.000Z",
  "path": "/api/users"
}
```

This maintains consistency with HTTP error conventions while keeping data responses standardized.