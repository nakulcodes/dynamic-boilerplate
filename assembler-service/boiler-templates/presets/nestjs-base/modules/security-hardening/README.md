# Security Hardening Module

This module provides comprehensive security hardening for NestJS applications with production-ready security features.

## Features

### 🛡️ Security Middleware
- **Helmet**: Security headers for common vulnerabilities
- **CORS**: Cross-Origin Resource Sharing with configurable origins
- **Rate Limiting**: Multiple rate limiting tiers (short, medium, long)
- **Input Sanitization**: XSS and injection prevention
- **HPP Protection**: HTTP Parameter Pollution prevention
- **MongoDB Sanitization**: NoSQL injection prevention

### 🔒 Security Headers
- Content Security Policy
- Cross-Origin Embedder Policy
- X-Frame-Options
- X-Content-Type-Options
- Referrer Policy
- Permissions Policy
- HSTS (HTTP Strict Transport Security)

### 📊 Security Monitoring
- Security event logging
- Request ID tracking
- Security health endpoint
- Configuration visibility endpoint

## Configuration

### Environment Variables

```env
# Rate Limiting
RATE_LIMIT_TTL=60000          # Time window in milliseconds (default: 1 minute)
RATE_LIMIT_MAX=100            # Max requests per time window (default: 100)

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com

# Helmet Configuration
HELMET_CSP_ENABLED=true       # Enable Content Security Policy
```

### Rate Limiting Tiers

The module implements three rate limiting tiers:

1. **Short**: 100 requests per minute (configurable)
2. **Medium**: 500 requests per 5 minutes
3. **Long**: 2000 requests per hour

## API Endpoints

### Security Health Check
```
GET /api/security/health
```

Returns security module status and enabled features.

### Public Security Configuration
```
GET /api/security/config
```

Returns non-sensitive security configuration information.

## Usage

### Basic Setup
The module is automatically configured when included in your project. It integrates with:

- Global validation pipes
- Request/response interceptors
- Express middleware stack
- NestJS guards system

### Custom Security Events
```typescript
import { SecurityService } from './modules/security/security.service';

@Injectable()
export class MyService {
  constructor(private securityService: SecurityService) {}

  someMethod() {
    // Log security events
    this.securityService.logSecurityEvent('SUSPICIOUS_ACTIVITY', {
      userId: 'user123',
      action: 'multiple_failed_logins'
    });
  }
}
```

### Input Sanitization
```typescript
import { SecurityService } from './modules/security/security.service';

@Injectable()
export class MyService {
  constructor(private securityService: SecurityService) {}

  processUserInput(input: any) {
    // Sanitize user input
    const sanitizedInput = this.securityService.sanitizeInput(input);
    return sanitizedInput;
  }
}
```

## Security Features Details

### Helmet Configuration
- **Content Security Policy**: Prevents XSS attacks
- **Frame Options**: Prevents clickjacking
- **HSTS**: Enforces HTTPS connections
- **XSS Filter**: Browser XSS protection
- **No Sniff**: Prevents MIME type sniffing

### CORS Protection
- Configurable allowed origins
- Automatic origin validation
- Credential support
- Security event logging for violations

### Input Sanitization
- HTML tag removal
- JavaScript protocol blocking
- Event handler attribute removal
- Recursive object/array sanitization

### Rate Limiting
- Configurable time windows
- Multiple concurrent limits
- Per-IP tracking
- Automatic throttling

## Production Considerations

### Security Headers
The module sets comprehensive security headers:
- `X-Request-ID`: Unique request tracking
- `X-Security-Policy`: Policy enforcement indicator
- `X-Content-Type-Options`: MIME type protection
- `X-Frame-Options`: Clickjacking protection
- `Referrer-Policy`: Referrer information control
- `Permissions-Policy`: Browser feature restrictions

### Monitoring
- All security events are logged with timestamps
- Failed CORS requests are tracked
- Rate limit violations are recorded
- Security health endpoint for monitoring systems

### Error Handling
- Production mode hides detailed validation errors
- Security violations logged without exposing internals
- Graceful degradation for misconfigured origins

## Dependencies

```json
{
  "@nestjs/throttler": "^6.2.1",
  "helmet": "^8.0.0",
  "express-rate-limit": "^7.4.1",
  "express-mongo-sanitize": "^2.2.0",
  "hpp": "^0.2.3"
}
```

## Testing

The module includes comprehensive security testing:

### Unit Tests
- Security service functionality
- Input sanitization effectiveness
- Configuration validation
- Event logging accuracy

### Integration Tests
- Middleware integration
- Header verification
- Rate limiting behavior
- CORS policy enforcement

### Security Tests
- XSS prevention validation
- Injection attack prevention
- Rate limiting effectiveness
- Header security verification

## Best Practices

1. **Environment Configuration**: Always configure CORS_ORIGINS in production
2. **Rate Limiting**: Adjust rate limits based on your application needs
3. **Monitoring**: Monitor security event logs regularly
4. **Headers**: Customize CSP based on your frontend requirements
5. **Sanitization**: Don't rely solely on input sanitization - validate at the DTO level too

## Troubleshooting

### Common Issues

1. **CORS Errors**: Check CORS_ORIGINS configuration
2. **Rate Limiting**: Adjust RATE_LIMIT_TTL and RATE_LIMIT_MAX
3. **CSP Violations**: Configure Content Security Policy for your frontend
4. **Header Conflicts**: Review custom header implementations

### Debug Mode
Set `NODE_ENV=development` to enable:
- Detailed error messages
- Swagger documentation
- Less restrictive security policies