import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SecurityService } from '../security.service';

@Injectable()
export class SecurityInterceptor implements NestInterceptor {
  constructor(private readonly securityService: SecurityService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Add security headers
    this.addSecurityHeaders(response);

    // Sanitize request body if present
    if (request.body && typeof request.body === 'object') {
      request.body = this.securityService.sanitizeInput(request.body);
    }

    // Sanitize query parameters
    if (request.query && typeof request.query === 'object') {
      request.query = this.securityService.sanitizeInput(request.query);
    }

    return next.handle().pipe(
      map((data) => {
        // Add security metadata to response
        if (data && typeof data === 'object' && data.meta) {
          data.meta.securityProcessed = true;
          data.meta.sanitized = true;
        }
        return data;
      }),
    );
  }

  private addSecurityHeaders(response: any) {
    // Add additional custom security headers
    response.setHeader('X-Request-ID', this.generateRequestId());
    response.setHeader('X-Security-Policy', 'enforced');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('X-Frame-Options', 'DENY');
    response.setHeader('Referrer-Policy', 'no-referrer');
    response.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}