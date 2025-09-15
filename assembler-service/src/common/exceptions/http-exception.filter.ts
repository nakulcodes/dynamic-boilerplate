import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponse } from '@interfaces/api-response.interface';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const exceptionResponse = exception.getResponse();
    const errorResponse = this.buildErrorResponse(
      exceptionResponse,
      status,
      request.url,
    );

    this.logger.error(
      `HTTP Exception: ${status} - ${request.method} ${request.url}`,
      JSON.stringify(errorResponse),
    );

    response.status(status).json(errorResponse);
  }

  private buildErrorResponse(
    exceptionResponse: string | object,
    status: number,
    path: string,
  ): ApiResponse {
    const baseResponse: ApiResponse = {
      success: false,
      timestamp: new Date().toISOString(),
      path,
      statusCode: status,
    };

    if (typeof exceptionResponse === 'string') {
      return {
        ...baseResponse,
        message: exceptionResponse,
      };
    }

    if (typeof exceptionResponse === 'object') {
      const responseObj = exceptionResponse as any;

      return {
        ...baseResponse,
        message: responseObj.message || this.getDefaultMessage(status),
        errors: responseObj.errors || undefined,
      };
    }

    return {
      ...baseResponse,
      message: this.getDefaultMessage(status),
    };
  }

  private getDefaultMessage(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'Bad Request';
      case HttpStatus.UNAUTHORIZED:
        return 'Unauthorized';
      case HttpStatus.FORBIDDEN:
        return 'Forbidden';
      case HttpStatus.NOT_FOUND:
        return 'Not Found';
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return 'Internal Server Error';
      default:
        return 'An error occurred';
    }
  }
}