import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AuditService } from './audit.service';
import { AUDIT_METADATA_KEY, AuditMetadata } from './audit.decorator';
import { AuditAction, AuditLevel } from '@db/entities/audit-log.entity';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditMetadata = this.reflector.get<AuditMetadata>(
      AUDIT_METADATA_KEY,
      context.getHandler(),
    );

    if (!auditMetadata) {
      return next.handle();
    }

    // Check if we should skip auditing based on condition
    if (auditMetadata.skipIf && auditMetadata.skipIf(context)) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const startTime = Date.now();

    // Extract common audit data
    const baseAuditData = {
      action: auditMetadata.action,
      level: auditMetadata.level,
      description: auditMetadata.description,
      resourceType: auditMetadata.resourceType,
      userId: this.extractUserId(context, auditMetadata),
      username: this.extractUsername(context),
      resourceId: this.extractResourceId(context, auditMetadata),
      method: request.method,
      endpoint: request.path,
      ipAddress: request.ip || request.connection?.remoteAddress,
      userAgent: request.get('User-Agent'),
      sessionId: request.sessionID,
      correlationId: request.correlationId,
    };

    return next.handle().pipe(
      tap((response) => {
        const duration = Date.now() - startTime;
        const httpResponse = context.switchToHttp().getResponse();

        this.createAuditLog({
          ...baseAuditData,
          statusCode: httpResponse.statusCode,
          duration,
          details: this.extractDetails(context, auditMetadata, request, response),
        });
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;

        this.createAuditLog({
          ...baseAuditData,
          statusCode: error.status || 500,
          duration,
          errorMessage: error.message,
          level: AuditLevel.HIGH, // Errors are always high priority
          details: this.extractDetails(context, auditMetadata, request, null, error),
        });

        throw error;
      }),
    );
  }

  private extractUserId(context: ExecutionContext, metadata: AuditMetadata): string | undefined {
    if (metadata.extractUserId) {
      return metadata.extractUserId(context);
    }

    const request = context.switchToHttp().getRequest();
    return request.user?.id || request.user?.sub;
  }

  private extractUsername(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest();
    return request.user?.username || request.user?.email;
  }

  private extractResourceId(context: ExecutionContext, metadata: AuditMetadata): string | undefined {
    if (metadata.extractResourceId) {
      return metadata.extractResourceId(context);
    }

    const request = context.switchToHttp().getRequest();
    return request.params?.id;
  }

  private extractDetails(
    context: ExecutionContext,
    metadata: AuditMetadata,
    request: any,
    response?: any,
    error?: any,
  ): Record<string, any> {
    const details: Record<string, any> = {};

    // Include request data if specified
    if (metadata.includeRequest && request.body) {
      details.requestBody = this.sanitizeData(request.body, metadata.sensitiveFields);
    }

    // Include query parameters
    if (request.query && Object.keys(request.query).length > 0) {
      details.queryParams = request.query;
    }

    // Include request parameters
    if (request.params && Object.keys(request.params).length > 0) {
      details.requestParams = request.params;
    }

    // Include response data if specified
    if (metadata.includeResponse && response) {
      details.responseBody = this.sanitizeData(response, metadata.sensitiveFields);
    }

    // Include error details if present
    if (error) {
      details.error = {
        message: error.message,
        stack: error.stack,
        code: error.code,
      };
    }

    return details;
  }

  private sanitizeData(data: any, sensitiveFields: string[] = []): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const defaultSensitiveFields = [
      'password',
      'token',
      'secret',
      'key',
      'authorization',
      'cookie',
      'ssn',
      'creditCard',
      'cardNumber',
    ];

    const allSensitiveFields = [...defaultSensitiveFields, ...sensitiveFields];

    const sanitize = (obj: any): any => {
      if (!obj || typeof obj !== 'object') return obj;

      if (Array.isArray(obj)) {
        return obj.map(sanitize);
      }

      const sanitized = { ...obj };
      for (const [key, value] of Object.entries(sanitized)) {
        if (allSensitiveFields.some(field =>
          key.toLowerCase().includes(field.toLowerCase())
        )) {
          sanitized[key] = '***REDACTED***';
        } else if (typeof value === 'object') {
          sanitized[key] = sanitize(value);
        }
      }
      return sanitized;
    };

    return sanitize(data);
  }

  private async createAuditLog(auditData: any): Promise<void> {
    try {
      await this.auditService.log(auditData);
    } catch (error) {
      this.logger.error('Failed to create audit log in interceptor:', error);
    }
  }
}