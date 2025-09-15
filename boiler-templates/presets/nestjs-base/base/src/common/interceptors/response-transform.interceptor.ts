import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request, Response } from 'express';
import { ApiResponse, PaginatedApiResponse } from '@interfaces/api-response.interface';
import { ResponseMetaDto } from '@dto/response/api-response.dto';

@Injectable()
export class ResponseTransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T> | PaginatedApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T> | PaginatedApiResponse<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((data) => {
        // If the data is already in standardized API response format (has payload property), return it as is
        if (this.isStandardizedResponse(data)) {
          return data;
        }

        // If the data is legacy format (has success property), transform it
        if (this.isLegacyResponse(data)) {
          return this.transformLegacyResponse(data);
        }

        // For raw data responses, wrap in standardized format
        return this.wrapRawData(data);
      }),
    );
  }

  /**
   * Check if response is already in standardized payload/meta format
   */
  private isStandardizedResponse(data: any): boolean {
    return (
      data &&
      typeof data === 'object' &&
      'payload' in data &&
      (data.meta === undefined || typeof data.meta === 'object')
    );
  }

  /**
   * Check if response is in legacy success/data format
   */
  private isLegacyResponse(data: any): boolean {
    return (
      data &&
      typeof data === 'object' &&
      'success' in data &&
      'timestamp' in data &&
      !('payload' in data)
    );
  }

  /**
   * Transform legacy response format to standardized format
   */
  private transformLegacyResponse(legacyData: any): ApiResponse<any> {
    const meta = new ResponseMetaDto();

    // Preserve original timestamp if available
    if (legacyData.timestamp) {
      meta.timestamp = legacyData.timestamp;
    }

    // Add any additional legacy metadata
    if (legacyData.path) {
      meta.path = legacyData.path;
    }
    if (legacyData.statusCode) {
      meta.statusCode = legacyData.statusCode;
    }
    if (legacyData.message) {
      meta.message = legacyData.message;
    }

    return {
      payload: legacyData.data || legacyData,
      meta: meta,
    };
  }

  /**
   * Wrap raw data in standardized response format
   */
  private wrapRawData(data: any): ApiResponse<any> {
    // Handle null or undefined data
    if (data === null || data === undefined) {
      return {
        payload: null,
        meta: new ResponseMetaDto(),
      };
    }

    // Check if this looks like a paginated response (has array data with pagination info)
    if (this.isPaginatedResponse(data)) {
      return this.transformToPaginatedResponse(data);
    }

    // For regular single item responses
    return {
      payload: data,
      meta: new ResponseMetaDto(),
    };
  }

  /**
   * Check if data appears to be a paginated response
   */
  private isPaginatedResponse(data: any): boolean {
    return (
      data &&
      typeof data === 'object' &&
      (
        // Common pagination patterns with explicit pagination metadata
        ('items' in data && Array.isArray(data.items) && 'total' in data) ||
        ('data' in data && Array.isArray(data.data) && ('total' in data || 'count' in data)) ||
        ('results' in data && Array.isArray(data.results) && 'total' in data) ||
        // Direct array with pagination metadata (only if it's non-empty and contains objects)
        (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object')
      )
    );
  }

  /**
   * Transform data to paginated response format
   */
  private transformToPaginatedResponse(data: any): PaginatedApiResponse<any> {
    let items: any[] = [];
    let page = 1;
    let limit = 50;
    let total = 0;

    // Extract pagination data based on common patterns
    if ('items' in data && Array.isArray(data.items)) {
      items = data.items;
      total = data.total || data.count || items.length;
      page = data.page || data.currentPage || 1;
      limit = data.limit || data.pageSize || data.perPage || 50;
    } else if ('data' in data && Array.isArray(data.data)) {
      items = data.data;
      total = data.total || data.count || items.length;
      page = data.page || data.currentPage || 1;
      limit = data.limit || data.pageSize || data.perPage || 50;
    } else if ('results' in data && Array.isArray(data.results)) {
      items = data.results;
      total = data.total || data.count || items.length;
      page = data.page || data.currentPage || 1;
      limit = data.limit || data.pageSize || data.perPage || 50;
    } else if (Array.isArray(data)) {
      // If it's just an array, treat as single page
      items = data;
      total = data.length;
      page = 1;
      limit = Math.max(data.length, 50);
    }

    // Calculate additional pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    return {
      payload: items,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrevious,
      },
    };
  }
}