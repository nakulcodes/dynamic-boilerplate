import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SecurityConfig {
  corsOrigins: string[];
  rateLimiting: {
    ttl: number;
    max: number;
  };
  helmet: {
    contentSecurityPolicy: boolean;
    crossOriginEmbedderPolicy: boolean;
    crossOriginOpenerPolicy: boolean;
    crossOriginResourcePolicy: boolean;
    dnsPrefetchControl: boolean;
    frameguard: boolean;
    hidePoweredBy: boolean;
    hsts: boolean;
    ieNoOpen: boolean;
    noSniff: boolean;
    originAgentCluster: boolean;
    permittedCrossDomainPolicies: boolean;
    referrerPolicy: boolean;
    xssFilter: boolean;
  };
}

@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name);

  constructor(private readonly configService: ConfigService) {}

  getSecurityConfig(): SecurityConfig {
    const corsOriginsEnv = this.configService.get<string>('CORS_ORIGINS', 'http://localhost:3000');
    const corsOrigins = corsOriginsEnv.split(',').map(origin => origin.trim());

    const config: SecurityConfig = {
      corsOrigins,
      rateLimiting: {
        ttl: this.configService.get<number>('RATE_LIMIT_TTL', 60000),
        max: this.configService.get<number>('RATE_LIMIT_MAX', 100),
      },
      helmet: {
        contentSecurityPolicy: this.configService.get<boolean>('HELMET_CSP_ENABLED', true),
        crossOriginEmbedderPolicy: true,
        crossOriginOpenerPolicy: true,
        crossOriginResourcePolicy: { policy: 'cross-origin' } as any,
        dnsPrefetchControl: true,
        frameguard: { action: 'deny' } as any,
        hidePoweredBy: true,
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true,
        } as any,
        ieNoOpen: true,
        noSniff: true,
        originAgentCluster: true,
        permittedCrossDomainPolicies: false,
        referrerPolicy: { policy: 'no-referrer' } as any,
        xssFilter: true,
      },
    };

    this.logger.log('Security configuration loaded');
    return config;
  }

  logSecurityEvent(event: string, details: any = {}) {
    this.logger.warn(`Security Event: ${event}`, { ...details, timestamp: new Date().toISOString() });
  }

  sanitizeInput(input: any): any {
    if (typeof input === 'string') {
      // Basic HTML sanitization
      return input
        .replace(/[<>]/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '');
    }

    if (Array.isArray(input)) {
      return input.map(item => this.sanitizeInput(item));
    }

    if (input && typeof input === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(input)) {
        sanitized[key] = this.sanitizeInput(value);
      }
      return sanitized;
    }

    return input;
  }

  validateOrigin(origin: string): boolean {
    const config = this.getSecurityConfig();
    return config.corsOrigins.includes(origin) || config.corsOrigins.includes('*');
  }
}