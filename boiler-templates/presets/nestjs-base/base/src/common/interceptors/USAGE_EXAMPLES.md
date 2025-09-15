# Response Transform Interceptor - Usage Examples

This document provides concrete examples of how the `ResponseTransformInterceptor` transforms different response formats to the standardized `payload/meta` structure.

## Example Scenarios

### 1. Controller Using StandardizedResponse DTOs

**Controller Code:**
```typescript
@Get(':id')
@ApiResponse({ status: 200, type: UserResponseDto })
async findOne(@Param('id') id: string): Promise<UserResponseDto> {
  const user = await this.usersService.findOne(id);
  return new UserResponseDto(user);
}
```

**Response (passes through unchanged):**
```json
{
  "payload": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "meta": {
    "timestamp": "2025-09-16T10:00:00.000Z"
  }
}
```

### 2. Controller Using ResponseFactory

**Controller Code:**
```typescript
@Delete(':id')
async remove(@Param('id') id: string) {
  await this.usersService.remove(id);

  return ResponseFactory.success({
    message: 'User deleted successfully',
    deletedId: id
  });
}
```

**Response (passes through unchanged):**
```json
{
  "payload": {
    "message": "User deleted successfully",
    "deletedId": "123e4567-e89b-12d3-a456-426614174000"
  },
  "meta": {
    "timestamp": "2025-09-16T10:00:00.000Z"
  }
}
```

### 3. Legacy Controller (Automatic Transformation)

**Controller Code:**
```typescript
@Get(':id')
async findOne(@Param('id') id: string) {
  const user = await this.usersService.findOne(id);

  return {
    success: true,
    message: 'User found',
    data: user,
    timestamp: new Date().toISOString()
  };
}
```

**Response (automatically transformed):**
```json
{
  "payload": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "meta": {
    "timestamp": "2025-09-16T10:00:00.000Z",
    "message": "User found"
  }
}
```

### 4. Raw Object Response (Automatic Wrapping)

**Controller Code:**
```typescript
@Get(':id')
async findOne(@Param('id') id: string) {
  const user = await this.usersService.findOne(id);
  return user; // Raw entity/object
}
```

**Response (automatically wrapped):**
```json
{
  "payload": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "meta": {
    "timestamp": "2025-09-16T10:00:00.000Z"
  }
}
```

### 5. Primitive Value Response

**Controller Code:**
```typescript
@Get('count')
async getCount(): Promise<number> {
  return await this.usersService.count();
}
```

**Response (automatically wrapped):**
```json
{
  "payload": 42,
  "meta": {
    "timestamp": "2025-09-16T10:00:00.000Z"
  }
}
```

### 6. Paginated Response with StandardizedDTO

**Controller Code:**
```typescript
@Get()
@ApiResponse({ status: 200, type: PaginatedUsersResponseDto })
async findAll(@Query() paginationDto: PaginationDto): Promise<PaginatedUsersResponseDto> {
  const { page = 1, limit = 50 } = paginationDto;
  const { users, total } = await this.usersService.findAll(page, limit);

  return new PaginatedUsersResponseDto(users, page, limit, total);
}
```

**Response (passes through unchanged):**
```json
{
  "payload": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "John Doe",
      "email": "john@example.com"
    },
    {
      "id": "456e7890-e12b-34c5-d678-901234567890",
      "name": "Jane Smith",
      "email": "jane@example.com"
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

### 7. Legacy Pagination (Automatic Transformation)

**Controller Code:**
```typescript
@Get()
async findAll(@Query() paginationDto: PaginationDto) {
  const { page = 1, limit = 50 } = paginationDto;
  const { users, total } = await this.usersService.findAll(page, limit);

  return {
    items: users,
    total,
    page,
    limit
  };
}
```

**Response (automatically transformed):**
```json
{
  "payload": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "John Doe",
      "email": "john@example.com"
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

### 8. Different Pagination Patterns (All Transformed)

**Pattern 1: data/count**
```typescript
// Controller returns:
{
  data: [...],
  count: 100,
  currentPage: 2,
  pageSize: 20
}

// Transformed to:
{
  "payload": [...],
  "meta": {
    "page": 2,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrevious": true
  }
}
```

**Pattern 2: results/total**
```typescript
// Controller returns:
{
  results: [...],
  total: 150,
  page: 3,
  perPage: 30
}

// Transformed to:
{
  "payload": [...],
  "meta": {
    "page": 3,
    "limit": 30,
    "total": 150,
    "totalPages": 5,
    "hasNext": true,
    "hasPrevious": true
  }
}
```

**Pattern 3: Plain Array**
```typescript
// Controller returns:
[{ id: 1 }, { id: 2 }, { id: 3 }]

// Transformed to:
{
  "payload": [{ "id": 1 }, { "id": 2 }, { "id": 3 }],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 3,
    "totalPages": 1,
    "hasNext": false,
    "hasPrevious": false
  }
}
```

### 9. Empty Results

**Empty Array:**
```typescript
// Controller returns: []
{
  "payload": [],
  "meta": {
    "timestamp": "2025-09-16T10:00:00.000Z"
  }
}
```

**Empty Paginated Response:**
```typescript
// Controller returns: { items: [], total: 0, page: 1, limit: 50 }
{
  "payload": [],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 0,
    "totalPages": 0,
    "hasNext": false,
    "hasPrevious": false
  }
}
```

### 10. Error Responses (NOT Transformed)

Error responses continue to use the standard NestJS format and are **not** transformed by this interceptor:

```json
{
  "success": false,
  "message": "User not found",
  "timestamp": "2025-09-16T10:00:00.000Z",
  "path": "/api/users/invalid-id",
  "statusCode": 404
}
```

## Migration Timeline

### Before Interceptor
```json
// Inconsistent formats across endpoints
{ "success": true, "data": {...} }
{ "items": [...], "total": 100 }
{ "id": 1, "name": "..." }
```

### After Interceptor Installation
```json
// All responses automatically standardized
{
  "payload": {...},
  "meta": { "timestamp": "..." }
}
```

### After Controller Migration
```json
// Explicit standardized DTOs with rich metadata
{
  "payload": {...},
  "meta": {
    "timestamp": "...",
    "version": "v1",
    "cached": false
  }
}
```

## Implementation Notes

1. **Zero Breaking Changes**: Existing clients continue to receive responses in standardized format
2. **Automatic Detection**: No manual configuration needed for different response types
3. **Performance**: Minimal overhead, only processes response data without additional network calls
4. **Type Safety**: Full TypeScript support with proper generic typing
5. **Swagger Compatible**: Automatically works with existing Swagger documentation when using standardized DTOs