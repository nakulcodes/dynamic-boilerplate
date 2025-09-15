import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { ResponseTransformInterceptor } from './response-transform.interceptor';
import { ApiResponse, PaginatedApiResponse } from '@interfaces/api-response.interface';

describe('ResponseTransformInterceptor', () => {
  let interceptor: ResponseTransformInterceptor<any>;
  let mockExecutionContext: Partial<ExecutionContext>;
  let mockCallHandler: Partial<CallHandler>;

  beforeEach(() => {
    interceptor = new ResponseTransformInterceptor();

    mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({ url: '/api/test' }),
        getResponse: () => ({ statusCode: 200 }),
      }),
    } as any;

    mockCallHandler = {
      handle: jest.fn(),
    };
  });

  describe('Standardized Response Detection', () => {
    it('should pass through already standardized responses', (done) => {
      const standardizedData = {
        payload: { id: 1, name: 'Test User' },
        meta: { timestamp: '2025-09-16T10:00:00.000Z' },
      };

      mockCallHandler.handle = jest.fn(() => of(standardizedData));

      interceptor
        .intercept(mockExecutionContext as ExecutionContext, mockCallHandler as CallHandler)
        .subscribe((result) => {
          expect(result).toEqual(standardizedData);
          expect(result.payload).toEqual({ id: 1, name: 'Test User' });
          expect(result.meta).toEqual({ timestamp: '2025-09-16T10:00:00.000Z' });
          done();
        });
    });

    it('should pass through standardized paginated responses', (done) => {
      const paginatedData = {
        payload: [{ id: 1 }, { id: 2 }],
        meta: {
          page: 1,
          limit: 50,
          total: 100,
          totalPages: 2,
          hasNext: true,
          hasPrevious: false,
        },
      };

      mockCallHandler.handle = jest.fn(() => of(paginatedData));

      interceptor
        .intercept(mockExecutionContext as ExecutionContext, mockCallHandler as CallHandler)
        .subscribe((result) => {
          expect(result).toEqual(paginatedData);
          expect(result.payload).toHaveLength(2);
          expect(result.meta.page).toBe(1);
          expect(result.meta.total).toBe(100);
          done();
        });
    });
  });

  describe('Legacy Response Transformation', () => {
    it('should transform legacy success/data format to standardized format', (done) => {
      const legacyData = {
        success: true,
        message: 'Request successful',
        data: { id: 1, name: 'Test User' },
        timestamp: '2025-09-16T10:00:00.000Z',
        path: '/api/users/1',
        statusCode: 200,
      };

      mockCallHandler.handle = jest.fn(() => of(legacyData));

      interceptor
        .intercept(mockExecutionContext as ExecutionContext, mockCallHandler as CallHandler)
        .subscribe((result: ApiResponse<any>) => {
          expect(result.payload).toEqual({ id: 1, name: 'Test User' });
          expect(result.meta).toBeDefined();
          expect(result.meta.timestamp).toBe('2025-09-16T10:00:00.000Z');
          expect(result.meta.path).toBe('/api/users/1');
          expect(result.meta.statusCode).toBe(200);
          expect(result.meta.message).toBe('Request successful');
          done();
        });
    });

    it('should handle legacy response without data field', (done) => {
      const legacyData = {
        success: true,
        message: 'Operation completed',
        timestamp: '2025-09-16T10:00:00.000Z',
      };

      mockCallHandler.handle = jest.fn(() => of(legacyData));

      interceptor
        .intercept(mockExecutionContext as ExecutionContext, mockCallHandler as CallHandler)
        .subscribe((result: ApiResponse<any>) => {
          expect(result.payload).toEqual(legacyData);
          expect(result.meta).toBeDefined();
          expect(result.meta.timestamp).toBe('2025-09-16T10:00:00.000Z');
          done();
        });
    });
  });

  describe('Raw Data Transformation', () => {
    it('should wrap simple object in standardized format', (done) => {
      const rawData = { id: 1, name: 'Test User', email: 'test@example.com' };

      mockCallHandler.handle = jest.fn(() => of(rawData));

      interceptor
        .intercept(mockExecutionContext as ExecutionContext, mockCallHandler as CallHandler)
        .subscribe((result: ApiResponse<any>) => {
          expect(result.payload).toEqual(rawData);
          expect(result.meta).toBeDefined();
          expect(result.meta.timestamp).toBeDefined();
          expect(new Date(result.meta.timestamp)).toBeInstanceOf(Date);
          done();
        });
    });

    it('should wrap simple string in standardized format', (done) => {
      const rawData = 'Hello World';

      mockCallHandler.handle = jest.fn(() => of(rawData));

      interceptor
        .intercept(mockExecutionContext as ExecutionContext, mockCallHandler as CallHandler)
        .subscribe((result: ApiResponse<any>) => {
          expect(result.payload).toBe('Hello World');
          expect(result.meta).toBeDefined();
          expect(result.meta.timestamp).toBeDefined();
          done();
        });
    });

    it('should handle null/undefined data', (done) => {
      mockCallHandler.handle = jest.fn(() => of(null));

      interceptor
        .intercept(mockExecutionContext as ExecutionContext, mockCallHandler as CallHandler)
        .subscribe((result: ApiResponse<any>) => {
          expect(result.payload).toBeNull();
          expect(result.meta).toBeDefined();
          expect(result.meta.timestamp).toBeDefined();
          done();
        });
    });
  });

  describe('Paginated Data Transformation', () => {
    it('should transform items/total pattern to paginated response', (done) => {
      const rawData = {
        items: [{ id: 1 }, { id: 2 }, { id: 3 }],
        total: 25,
        page: 2,
        limit: 10,
      };

      mockCallHandler.handle = jest.fn(() => of(rawData));

      interceptor
        .intercept(mockExecutionContext as ExecutionContext, mockCallHandler as CallHandler)
        .subscribe((result: PaginatedApiResponse<any>) => {
          expect(result.payload).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
          expect(result.meta.page).toBe(2);
          expect(result.meta.limit).toBe(10);
          expect(result.meta.total).toBe(25);
          expect(result.meta.totalPages).toBe(3);
          expect(result.meta.hasNext).toBe(true);
          expect(result.meta.hasPrevious).toBe(true);
          done();
        });
    });

    it('should transform data/count pattern to paginated response', (done) => {
      const rawData = {
        data: [{ id: 1 }, { id: 2 }],
        count: 50,
        currentPage: 1,
        pageSize: 20,
      };

      mockCallHandler.handle = jest.fn(() => of(rawData));

      interceptor
        .intercept(mockExecutionContext as ExecutionContext, mockCallHandler as CallHandler)
        .subscribe((result: PaginatedApiResponse<any>) => {
          expect(result.payload).toEqual([{ id: 1 }, { id: 2 }]);
          expect(result.meta.page).toBe(1);
          expect(result.meta.limit).toBe(20);
          expect(result.meta.total).toBe(50);
          expect(result.meta.totalPages).toBe(3);
          expect(result.meta.hasNext).toBe(true);
          expect(result.meta.hasPrevious).toBe(false);
          done();
        });
    });

    it('should transform results/total pattern to paginated response', (done) => {
      const rawData = {
        results: [{ id: 1 }, { id: 2 }, { id: 3 }],
        total: 3,
        page: 1,
        perPage: 10,
      };

      mockCallHandler.handle = jest.fn(() => of(rawData));

      interceptor
        .intercept(mockExecutionContext as ExecutionContext, mockCallHandler as CallHandler)
        .subscribe((result: PaginatedApiResponse<any>) => {
          expect(result.payload).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
          expect(result.meta.page).toBe(1);
          expect(result.meta.limit).toBe(10);
          expect(result.meta.total).toBe(3);
          expect(result.meta.totalPages).toBe(1);
          expect(result.meta.hasNext).toBe(false);
          expect(result.meta.hasPrevious).toBe(false);
          done();
        });
    });

    it('should transform plain array to paginated response', (done) => {
      const rawData = [{ id: 1 }, { id: 2 }, { id: 3 }];

      mockCallHandler.handle = jest.fn(() => of(rawData));

      interceptor
        .intercept(mockExecutionContext as ExecutionContext, mockCallHandler as CallHandler)
        .subscribe((result: PaginatedApiResponse<any>) => {
          expect(result.payload).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
          expect(result.meta.page).toBe(1);
          expect(result.meta.limit).toBe(50); // Default limit for arrays
          expect(result.meta.total).toBe(3);
          expect(result.meta.totalPages).toBe(1);
          expect(result.meta.hasNext).toBe(false);
          expect(result.meta.hasPrevious).toBe(false);
          done();
        });
    });

    it('should handle empty paginated response', (done) => {
      const rawData = {
        items: [],
        total: 0,
        page: 1,
        limit: 50,
      };

      mockCallHandler.handle = jest.fn(() => of(rawData));

      interceptor
        .intercept(mockExecutionContext as ExecutionContext, mockCallHandler as CallHandler)
        .subscribe((result: PaginatedApiResponse<any>) => {
          expect(result.payload).toEqual([]);
          expect(result.meta.page).toBe(1);
          expect(result.meta.limit).toBe(50);
          expect(result.meta.total).toBe(0);
          expect(result.meta.totalPages).toBe(0);
          expect(result.meta.hasNext).toBe(false);
          expect(result.meta.hasPrevious).toBe(false);
          done();
        });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty object', (done) => {
      const rawData = {};

      mockCallHandler.handle = jest.fn(() => of(rawData));

      interceptor
        .intercept(mockExecutionContext as ExecutionContext, mockCallHandler as CallHandler)
        .subscribe((result: ApiResponse<any>) => {
          expect(result.payload).toEqual({});
          expect(result.meta).toBeDefined();
          expect(result.meta.timestamp).toBeDefined();
          done();
        });
    });

    it('should handle boolean values', (done) => {
      const rawData = true;

      mockCallHandler.handle = jest.fn(() => of(rawData));

      interceptor
        .intercept(mockExecutionContext as ExecutionContext, mockCallHandler as CallHandler)
        .subscribe((result: ApiResponse<any>) => {
          expect(result.payload).toBe(true);
          expect(result.meta).toBeDefined();
          done();
        });
    });

    it('should handle numeric values', (done) => {
      const rawData = 42;

      mockCallHandler.handle = jest.fn(() => of(rawData));

      interceptor
        .intercept(mockExecutionContext as ExecutionContext, mockCallHandler as CallHandler)
        .subscribe((result: ApiResponse<any>) => {
          expect(result.payload).toBe(42);
          expect(result.meta).toBeDefined();
          done();
        });
    });

    it('should not treat empty array as paginated response', (done) => {
      const rawData: any[] = [];

      mockCallHandler.handle = jest.fn(() => of(rawData));

      interceptor
        .intercept(mockExecutionContext as ExecutionContext, mockCallHandler as CallHandler)
        .subscribe((result: ApiResponse<any>) => {
          expect(result.payload).toEqual([]);
          expect(result.meta).toBeDefined();
          expect(result.meta.timestamp).toBeDefined();
          // Should be regular response, not paginated because array is empty
          expect('page' in result.meta).toBe(false);
          done();
        });
    });
  });
});