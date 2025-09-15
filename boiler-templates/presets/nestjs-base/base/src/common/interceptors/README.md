# Response Transform Interceptor

The `ResponseTransformInterceptor` automatically transforms all API responses to follow the standardized `payload/meta` structure defined in the architectural guidelines.

## Overview

This interceptor ensures that all API responses consistently follow the standardized format without requiring manual transformation in each controller method. It provides backward compatibility with existing endpoints while enabling a gradual migration to the new format.

## Standardized Response Format

### Single Item Response
```typescript
{
  payload: T,              // The actual response data
  meta?: {                 // Optional metadata
    timestamp: string,     // Auto-generated timestamp
    [key: string]: any     // Additional metadata
  }
}
```

### Paginated Response
```typescript
{
  payload: T[],            // Array of items
  meta: {                  // Pagination metadata
    page: number,          // Current page (1-based)
    limit: number,         // Items per page
    total: number,         // Total number of items
    totalPages: number,    // Total number of pages
    hasNext: boolean,      // Whether there's a next page
    hasPrevious: boolean   // Whether there's a previous page
  }
}
```

## How It Works

The interceptor automatically detects and handles different response formats:

### 1. Already Standardized Responses
If a response already has the `payload/meta` structure, it passes through unchanged:

```typescript
// Controller returns:
return new UserResponseDto(user);

// Output:
{
  payload: { id: 1, name: "John Doe" },
  meta: { timestamp: "2025-09-16T10:00:00.000Z" }
}
```

### 2. Legacy Format Transformation
Legacy responses with `success/data` structure are automatically converted:

```typescript
// Controller returns:
return {
  success: true,
  message: "User found",
  data: { id: 1, name: "John Doe" },
  timestamp: "2025-09-16T10:00:00.000Z"
};

// Transformed to:
{
  payload: { id: 1, name: "John Doe" },
  meta: {
    timestamp: "2025-09-16T10:00:00.000Z",
    message: "User found"
  }
}
```

### 3. Raw Data Wrapping
Plain objects, arrays, or primitive values are wrapped in the standardized format:

```typescript
// Controller returns:
return { id: 1, name: "John Doe" };

// Transformed to:
{
  payload: { id: 1, name: "John Doe" },
  meta: { timestamp: "2025-09-16T10:00:00.000Z" }
}
```

### 4. Automatic Pagination Detection
The interceptor can detect and transform common pagination patterns:

```typescript
// Controller returns any of these patterns:
{ items: [...], total: 100, page: 1, limit: 50 }
{ data: [...], count: 100, currentPage: 1, pageSize: 50 }
{ results: [...], total: 100, page: 1, perPage: 50 }
[...] // Plain array

// All transformed to:
{
  payload: [...],
  meta: {
    page: 1,
    limit: 50,
    total: 100,
    totalPages: 2,
    hasNext: true,
    hasPrevious: false
  }
}
```

## Usage

### 1. Global Registration
Register the interceptor globally in your main application file:

```typescript
// main.ts
import { ResponseTransformInterceptor } from '@interceptors/response-transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Register globally
  app.useGlobalInterceptors(new ResponseTransformInterceptor());

  await app.listen(3000);
}
```

### 2. Module-Level Registration
Register in a specific module:

```typescript
// app.module.ts
import { ResponseTransformInterceptor } from '@interceptors/response-transform.interceptor';

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTransformInterceptor,
    },
  ],
})
export class AppModule {}
```

### 3. Controller-Level Registration
Apply to specific controllers:

```typescript
@Controller('users')
@UseInterceptors(ResponseTransformInterceptor)
export class UsersController {
  // All methods in this controller will use the interceptor
}
```

### 4. Method-Level Registration
Apply to specific methods:

```typescript
@Get(':id')
@UseInterceptors(ResponseTransformInterceptor)
async findOne(@Param('id') id: string) {
  // Only this method uses the interceptor
}
```

## Migration Strategy

The interceptor enables a gradual migration approach:

### Phase 1: Install Interceptor
- Add the interceptor globally
- Existing endpoints continue working unchanged
- Legacy responses are automatically transformed

### Phase 2: Update Controllers Gradually
- Update controllers one by one to use standardized DTOs
- Use `ResponseFactory` for quick standardized responses
- The interceptor detects and passes through standardized responses

### Phase 3: Complete Migration
- All controllers use standardized response DTOs
- Remove legacy response handling from the interceptor (optional)

## Best Practices

### 1. Use Standard DTOs
Prefer using the standardized response DTOs:

```typescript
@Get(':id')
async findOne(@Param('id') id: string): Promise<UserResponseDto> {
  const user = await this.usersService.findOne(id);
  return new UserResponseDto(user);
}
```

### 2. Use ResponseFactory for Quick Responses
For simple responses, use the ResponseFactory:

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

### 3. Leverage Automatic Pagination
Return data in common pagination patterns for automatic transformation:

```typescript
@Get()
async findAll(@Query() paginationDto: PaginationDto) {
  const { users, total } = await this.usersService.findAll(page, limit);

  // This will be automatically transformed to standardized format
  return {
    items: users,
    total,
    page,
    limit
  };
}
```

### 4. Swagger Documentation
Update your Swagger documentation to reflect the new format:

```typescript
@ApiResponse({
  status: 200,
  description: 'User details',
  type: UserResponseDto
})
@Get(':id')
async findOne(@Param('id') id: string): Promise<UserResponseDto> {
  // ...
}
```

## Error Handling

The interceptor only transforms successful responses. Error responses continue to use the standard NestJS exception format and are not modified.

## Testing

The interceptor includes comprehensive tests covering all transformation scenarios. Run tests with:

```bash
npm test response-transform.interceptor.spec.ts
```

## Configuration

The interceptor works out of the box with default settings. For custom behavior, you can extend the interceptor class and override specific methods.

## Troubleshooting

### Response Not Transformed
- Ensure the interceptor is properly registered
- Check that the response doesn't already have the `payload` property
- Verify imports are correct

### Pagination Not Detected
- Ensure your data follows one of the supported pagination patterns
- Check that arrays contain objects (empty arrays are not treated as paginated)
- Consider using explicit `PaginatedResponseDto` for complex cases

### TypeScript Errors
- Ensure proper imports of interfaces and DTOs
- Update controller return types to use standardized DTOs
- Check path aliases in tsconfig.json