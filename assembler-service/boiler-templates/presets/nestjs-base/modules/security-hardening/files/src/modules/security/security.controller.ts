import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SecurityService } from './security.service';

@ApiTags('security')
@Controller('security')
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  @Get('health')
  @ApiOperation({ summary: 'Security health check' })
  @ApiResponse({
    status: 200,
    description: 'Security module health status',
    schema: {
      type: 'object',
      properties: {
        payload: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'healthy' },
            timestamp: { type: 'string', format: 'date-time' },
            securityFeatures: {
              type: 'array',
              items: { type: 'string' },
              example: ['helmet', 'cors', 'rate-limiting', 'input-sanitization']
            }
          }
        },
        meta: {
          type: 'object',
          properties: {
            timestamp: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  })
  getSecurityHealth() {
    return {
      payload: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        securityFeatures: [
          'helmet',
          'cors',
          'rate-limiting',
          'input-sanitization',
          'request-validation',
          'security-headers'
        ]
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    };
  }

  @Get('config')
  @ApiOperation({ summary: 'Get public security configuration' })
  @ApiResponse({
    status: 200,
    description: 'Public security configuration (non-sensitive data only)',
  })
  getPublicSecurityConfig() {
    const config = this.securityService.getSecurityConfig();

    return {
      payload: {
        rateLimiting: {
          ttl: config.rateLimiting.ttl,
          max: config.rateLimiting.max,
        },
        corsOriginsCount: config.corsOrigins.length,
        helmetEnabled: true,
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    };
  }
}