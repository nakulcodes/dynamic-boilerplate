import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsObject, IsNotEmpty } from 'class-validator';
import { ApiResponse, PaginatedApiResponse, PaginationMetaData, ResponseMetaData } from '../../interfaces/api-response.interface';

/**
 * Base DTO class for standardized API responses
 * Use this for single item responses
 */
export class ApiResponseDto<T = any> implements ApiResponse<T> {
  @ApiProperty({
    description: 'The response data payload',
    example: { id: 1, name: 'Example Item' },
  })
  @IsNotEmpty()
  payload: T;

  @ApiPropertyOptional({
    description: 'Optional response metadata',
    example: { timestamp: '2025-09-16T10:00:00.000Z' },
  })
  @IsOptional()
  @IsObject()
  meta?: Record<string, any>;

  constructor(payload: T, meta?: Record<string, any>) {
    this.payload = payload;
    this.meta = meta;
  }
}

/**
 * Pagination metadata DTO
 */
export class PaginationMetaDto implements PaginationMetaData {
  @ApiProperty({
    description: 'Current page number',
    example: 1,
    minimum: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 50,
    minimum: 1,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of items',
    example: 1000,
    minimum: 0,
  })
  total: number;

  @ApiPropertyOptional({
    description: 'Total number of pages',
    example: 20,
    minimum: 0,
  })
  totalPages?: number;

  @ApiPropertyOptional({
    description: 'Whether there is a next page',
    example: true,
  })
  hasNext?: boolean;

  @ApiPropertyOptional({
    description: 'Whether there is a previous page',
    example: false,
  })
  hasPrevious?: boolean;

  constructor(page: number, limit: number, total: number) {
    this.page = page;
    this.limit = limit;
    this.total = total;
    this.totalPages = Math.ceil(total / limit);
    this.hasNext = page < this.totalPages;
    this.hasPrevious = page > 1;
  }
}

/**
 * Base DTO class for paginated API responses
 * Use this for list responses with pagination
 */
export class PaginatedResponseDto<T = any> implements PaginatedApiResponse<T> {
  @ApiProperty({
    description: 'Array of items for the current page',
    isArray: true,
  })
  payload: T[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMetaDto,
  })
  @Type(() => PaginationMetaDto)
  meta: PaginationMetaDto;

  constructor(payload: T[], page: number, limit: number, total: number) {
    this.payload = payload;
    this.meta = new PaginationMetaDto(page, limit, total);
  }

  /**
   * Static factory method for creating paginated responses
   */
  static create<T>(items: T[], page: number, limit: number, total: number): PaginatedResponseDto<T> {
    return new PaginatedResponseDto(items, page, limit, total);
  }
}

/**
 * Response metadata DTO for non-paginated responses
 */
export class ResponseMetaDto implements ResponseMetaData {
  @ApiPropertyOptional({
    description: 'Timestamp when the response was generated',
    example: '2025-09-16T10:00:00.000Z',
  })
  timestamp?: string;

  constructor(additionalMeta?: Record<string, any>) {
    this.timestamp = new Date().toISOString();
    if (additionalMeta) {
      Object.assign(this, additionalMeta);
    }
  }
}

/**
 * Success response factory
 * Helper functions to create standardized responses
 */
export class ResponseFactory {
  /**
   * Create a success response for a single item
   */
  static success<T>(payload: T, meta?: Record<string, any>): ApiResponseDto<T> {
    const responseMeta = meta || new ResponseMetaDto();
    return new ApiResponseDto(payload, responseMeta);
  }

  /**
   * Create a paginated response
   */
  static paginated<T>(
    items: T[],
    page: number,
    limit: number,
    total: number
  ): PaginatedResponseDto<T> {
    return PaginatedResponseDto.create(items, page, limit, total);
  }

  /**
   * Create an empty paginated response
   */
  static emptyPaginated<T>(page: number = 1, limit: number = 50): PaginatedResponseDto<T> {
    return PaginatedResponseDto.create<T>([], page, limit, 0);
  }
}