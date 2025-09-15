import { applyDecorators } from '@nestjs/common';
import { ApiResponse as SwaggerApiResponse } from '@nestjs/swagger';

interface ApiResponseDecoratorOptions {
  status: number;
  description: string;
  type?: any;
  isArray?: boolean;
}

export function ApiResponse(options: ApiResponseDecoratorOptions) {
  return applyDecorators(
    SwaggerApiResponse({
      status: options.status,
      description: options.description,
      type: options.type,
      isArray: options.isArray,
      schema: options.type ? undefined : {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: options.description,
          },
          data: options.isArray
            ? {
                type: 'array',
                items: { type: 'object' },
              }
            : { type: 'object' },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2023-01-01T00:00:00.000Z',
          },
          path: {
            type: 'string',
            example: '/api/endpoint',
          },
          statusCode: {
            type: 'number',
            example: options.status,
          },
        },
      },
    }),
  );
}

export function ApiSuccessResponse(description: string, type?: any, isArray?: boolean) {
  return ApiResponse({ status: 200, description, type, isArray });
}

export function ApiCreatedResponse(description: string, type?: any) {
  return ApiResponse({ status: 201, description, type });
}

export function ApiBadRequestResponse(description: string = 'Bad Request') {
  return ApiResponse({ status: 400, description });
}

export function ApiUnauthorizedResponse(description: string = 'Unauthorized') {
  return ApiResponse({ status: 401, description });
}

export function ApiForbiddenResponse(description: string = 'Forbidden') {
  return ApiResponse({ status: 403, description });
}

export function ApiNotFoundResponse(description: string = 'Not Found') {
  return ApiResponse({ status: 404, description });
}

export function ApiInternalServerErrorResponse(description: string = 'Internal Server Error') {
  return ApiResponse({ status: 500, description });
}

export function ApiConflictResponse(description: string = 'Conflict') {
  return ApiResponse({ status: 409, description });
}