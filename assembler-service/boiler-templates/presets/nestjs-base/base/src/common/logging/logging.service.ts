import { Injectable, LoggerService, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createLogger, Logger, format, transports } from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggingService implements LoggerService {
  private logger: Logger;

  constructor(private configService: ConfigService) {
    this.logger = createLogger({
      level: this.configService.get<string>('LOG_LEVEL') || 'info',
      format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.json(),
      ),
      defaultMeta: { service: '{{projectName}}' },
      transports: [
        new transports.Console({
          format: format.combine(
            format.colorize(),
            format.simple(),
            format.printf(({ level, message, timestamp, ...meta }) => {
              return `${timestamp} [${level}] ${message} ${
                Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
              }`;
            }),
          ),
        }),
        new DailyRotateFile({
          filename: 'logs/application-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
        }),
      ],
    });
  }

  log(message: any, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: any, trace?: string, context?: string) {
    this.logger.error(message, { context, trace });
  }

  warn(message: any, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: any, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: any, context?: string) {
    this.logger.verbose(message, { context });
  }
}