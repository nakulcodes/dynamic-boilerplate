import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  HealthCheckService,
  HttpHealthIndicator,
  TypeOrmHealthIndicator,
  HealthCheck,
  HealthCheckResult,
} from '@nestjs/terminus';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private db: TypeOrmHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Health check successful',
    schema: {
      example: {
        status: 'ok',
        info: {
          database: { status: 'up' },
          memory_heap: { status: 'up' },
          memory_rss: { status: 'up' }
        },
        error: {},
        details: {
          database: { status: 'up' },
          memory_heap: { status: 'up' },
          memory_rss: { status: 'up' }
        }
      }
    }
  })
  @ApiResponse({
    status: 503,
    description: 'Health check failed'
  })
  check(): Promise<HealthCheckResult> {
    return this.health.check([
      // Database health check
      () => this.db.pingCheck('database'),

      // Memory health checks
      () => this.health.getStatus('memory_heap', () => ({
        status: process.memoryUsage().heapUsed < 150 * 1024 * 1024 ? 'up' : 'down',
        heapUsed: process.memoryUsage().heapUsed,
        heapTotal: process.memoryUsage().heapTotal,
        heapUsedMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        heapTotalMB: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      })),

      () => this.health.getStatus('memory_rss', () => ({
        status: process.memoryUsage().rss < 150 * 1024 * 1024 ? 'up' : 'down',
        rss: process.memoryUsage().rss,
        rssMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
      })),
    ]);
  }

  @Get('ping')
  @ApiOperation({ summary: 'Simple ping endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Service is alive',
    schema: {
      example: {
        message: 'pong',
        timestamp: '2025-09-15T22:30:00.000Z',
        uptime: 3600.123,
        version: '1.0.0',
        environment: 'development'
      }
    }
  })
  ping() {
    return {
      message: 'pong',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      pid: process.pid,
    };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe for Kubernetes' })
  @ApiResponse({
    status: 200,
    description: 'Service is ready to serve requests'
  })
  @ApiResponse({
    status: 503,
    description: 'Service is not ready'
  })
  ready(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.db.pingCheck('database', { timeout: 1000 }),
    ]);
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness probe for Kubernetes' })
  @ApiResponse({
    status: 200,
    description: 'Service is alive'
  })
  live() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Basic application metrics' })
  @ApiResponse({
    status: 200,
    description: 'Application metrics',
    schema: {
      example: {
        memory: {
          heapUsed: 50331648,
          heapTotal: 67108864,
          heapUsedMB: 48,
          heapTotalMB: 64,
          rss: 100663296,
          rssMB: 96,
          external: 1024000
        },
        uptime: 3600.123,
        cpuUsage: {
          user: 123456,
          system: 654321
        },
        loadavg: [1.2, 1.1, 1.0],
        version: "16.14.0"
      }
    }
  })
  metrics() {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    return {
      memory: {
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        heapUsedMB: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotalMB: Math.round(memUsage.heapTotal / 1024 / 1024),
        rss: memUsage.rss,
        rssMB: Math.round(memUsage.rss / 1024 / 1024),
        external: memUsage.external,
      },
      uptime: process.uptime(),
      cpuUsage: {
        user: cpuUsage.user,
        system: cpuUsage.system,
      },
      loadavg: require('os').loadavg(),
      version: process.version,
      platform: process.platform,
      arch: process.arch,
    };
  }
}