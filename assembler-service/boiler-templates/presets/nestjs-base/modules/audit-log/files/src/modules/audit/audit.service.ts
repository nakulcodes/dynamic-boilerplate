import { Injectable, Logger } from '@nestjs/common';
import { TypedConfigService } from '@modules/config/config.service';
import { AuditLogRepository } from '@db/repositories/audit-log.repository';
import { AuditLog, AuditAction, AuditLevel } from '@db/entities/audit-log.entity';

export interface CreateAuditLogData {
  action: AuditAction;
  level: AuditLevel;
  userId?: string;
  username?: string;
  resourceType?: string;
  resourceId?: string;
  description?: string;
  details?: Record<string, any>;
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
  ipAddress?: string;
  userAgent?: string;
  method?: string;
  endpoint?: string;
  statusCode?: number;
  duration?: number;
  errorMessage?: string;
  sessionId?: string;
  correlationId?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    private readonly auditRepository: AuditLogRepository,
    private readonly configService: TypedConfigService,
  ) {}

  /**
   * Create a new audit log entry
   */
  async log(data: CreateAuditLogData): Promise<AuditLog | null> {
    try {
      const auditConfig = this.configService.audit;

      if (!auditConfig) {
        this.logger.warn('Audit configuration not found, skipping audit log');
        return null;
      }

      // Check if we should log based on configuration
      if (!this.shouldLog(data.action, data.level, auditConfig)) {
        return null;
      }

      // Sanitize sensitive data
      const sanitizedData = this.sanitizeData(data);

      const auditLog = await this.auditRepository.createAuditLog(sanitizedData);

      // Log to console for non-database sinks
      if (auditConfig.AUDIT_SINK === 'console') {
        this.logToConsole(auditLog);
      } else if (auditConfig.AUDIT_SINK === 'file') {
        this.logToFile(auditLog);
      }

      return auditLog;
    } catch (error) {
      this.logger.error('Failed to create audit log:', error);
      return null;
    }
  }

  /**
   * Log user authentication events
   */
  async logAuth(
    action: AuditAction.LOGIN | AuditAction.LOGOUT | AuditAction.FAILED_LOGIN,
    userId?: string,
    username?: string,
    details?: Record<string, any>,
    request?: any
  ): Promise<AuditLog | null> {
    const level = action === AuditAction.FAILED_LOGIN ? AuditLevel.HIGH : AuditLevel.MEDIUM;

    return this.log({
      action,
      level,
      userId,
      username,
      description: this.getActionDescription(action),
      details,
      ipAddress: request?.ip || request?.connection?.remoteAddress,
      userAgent: request?.get('User-Agent'),
      sessionId: request?.sessionID,
      correlationId: request?.correlationId,
    });
  }

  /**
   * Log data access events
   */
  async logDataAccess(
    action: AuditAction,
    resourceType: string,
    resourceId?: string,
    userId?: string,
    username?: string,
    details?: Record<string, any>,
    request?: any
  ): Promise<AuditLog | null> {
    const level = action === AuditAction.DELETE ? AuditLevel.HIGH : AuditLevel.MEDIUM;

    return this.log({
      action,
      level,
      userId,
      username,
      resourceType,
      resourceId,
      description: `${action} ${resourceType}${resourceId ? ` (ID: ${resourceId})` : ''}`,
      details,
      method: request?.method,
      endpoint: request?.path,
      ipAddress: request?.ip || request?.connection?.remoteAddress,
      userAgent: request?.get('User-Agent'),
      sessionId: request?.sessionID,
      correlationId: request?.correlationId,
    });
  }

  /**
   * Log sensitive data access
   */
  async logSensitiveAccess(
    description: string,
    resourceType?: string,
    resourceId?: string,
    userId?: string,
    username?: string,
    details?: Record<string, any>,
    request?: any
  ): Promise<AuditLog | null> {
    return this.log({
      action: AuditAction.SENSITIVE_DATA_ACCESS,
      level: AuditLevel.CRITICAL,
      userId,
      username,
      resourceType,
      resourceId,
      description,
      details,
      method: request?.method,
      endpoint: request?.path,
      ipAddress: request?.ip || request?.connection?.remoteAddress,
      userAgent: request?.get('User-Agent'),
      sessionId: request?.sessionID,
      correlationId: request?.correlationId,
    });
  }

  /**
   * Log configuration changes
   */
  async logConfigChange(
    description: string,
    changes?: { before?: any; after?: any },
    userId?: string,
    username?: string,
    request?: any
  ): Promise<AuditLog | null> {
    return this.log({
      action: AuditAction.CONFIGURATION_CHANGE,
      level: AuditLevel.CRITICAL,
      userId,
      username,
      description,
      changes,
      method: request?.method,
      endpoint: request?.path,
      ipAddress: request?.ip || request?.connection?.remoteAddress,
      userAgent: request?.get('User-Agent'),
      sessionId: request?.sessionID,
      correlationId: request?.correlationId,
    });
  }

  /**
   * Log permission denied events
   */
  async logPermissionDenied(
    resourceType?: string,
    resourceId?: string,
    userId?: string,
    username?: string,
    details?: Record<string, any>,
    request?: any
  ): Promise<AuditLog | null> {
    return this.log({
      action: AuditAction.PERMISSION_DENIED,
      level: AuditLevel.HIGH,
      userId,
      username,
      resourceType,
      resourceId,
      description: `Permission denied for ${resourceType || 'resource'}${resourceId ? ` (ID: ${resourceId})` : ''}`,
      details,
      method: request?.method,
      endpoint: request?.path,
      statusCode: 403,
      ipAddress: request?.ip || request?.connection?.remoteAddress,
      userAgent: request?.get('User-Agent'),
      sessionId: request?.sessionID,
      correlationId: request?.correlationId,
    });
  }

  /**
   * Archive old audit logs based on retention policy
   */
  async archiveOldLogs(): Promise<number> {
    const auditConfig = this.configService.audit;

    if (!auditConfig) {
      this.logger.warn('Audit configuration not found, skipping archive');
      return 0;
    }

    const retentionDays = auditConfig.AUDIT_RETENTION_DAYS;
    const archivedCount = await this.auditRepository.archiveOldLogs(retentionDays);

    this.logger.log(`Archived ${archivedCount} old audit logs (older than ${retentionDays} days)`);
    return archivedCount;
  }

  /**
   * Delete archived audit logs
   */
  async deleteArchivedLogs(): Promise<number> {
    const deletedCount = await this.auditRepository.deleteArchivedLogs();
    this.logger.log(`Deleted ${deletedCount} archived audit logs`);
    return deletedCount;
  }

  /**
   * Check if we should log based on configuration
   */
  private shouldLog(action: AuditAction, level: AuditLevel, auditConfig: any): boolean {
    const logLevel = auditConfig.AUDIT_LOG_LEVEL;

    switch (logLevel) {
      case 'critical':
        return level === AuditLevel.CRITICAL;
      case 'sensitive':
        return level === AuditLevel.CRITICAL || action === AuditAction.SENSITIVE_DATA_ACCESS;
      case 'all':
      default:
        return true;
    }
  }

  /**
   * Sanitize sensitive data from audit logs
   */
  private sanitizeData(data: CreateAuditLogData): CreateAuditLogData {
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'ssn', 'creditCard'];

    const sanitize = (obj: any): any => {
      if (!obj || typeof obj !== 'object') return obj;

      if (Array.isArray(obj)) {
        return obj.map(sanitize);
      }

      const sanitized = { ...obj };
      for (const [key, value] of Object.entries(sanitized)) {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
          sanitized[key] = '***REDACTED***';
        } else if (typeof value === 'object') {
          sanitized[key] = sanitize(value);
        }
      }
      return sanitized;
    };

    return {
      ...data,
      details: data.details ? sanitize(data.details) : undefined,
      changes: data.changes ? {
        before: data.changes.before ? sanitize(data.changes.before) : undefined,
        after: data.changes.after ? sanitize(data.changes.after) : undefined,
      } : undefined,
      metadata: data.metadata ? sanitize(data.metadata) : undefined,
    };
  }

  /**
   * Log to console
   */
  private logToConsole(auditLog: AuditLog): void {
    this.logger.log(`[AUDIT] ${auditLog.action} - ${auditLog.description}`, {
      userId: auditLog.userId,
      level: auditLog.level,
      resourceType: auditLog.resourceType,
      resourceId: auditLog.resourceId,
      timestamp: auditLog.timestamp,
    });
  }

  /**
   * Log to file (placeholder - implement based on requirements)
   */
  private logToFile(auditLog: AuditLog): void {
    // Implement file logging logic here
    // Could use winston, pino, or other logging libraries
    this.logger.debug('File audit logging not implemented yet');
  }

  /**
   * Get description for audit actions
   */
  private getActionDescription(action: AuditAction): string {
    const descriptions: Record<AuditAction, string> = {
      [AuditAction.CREATE]: 'Resource created',
      [AuditAction.UPDATE]: 'Resource updated',
      [AuditAction.DELETE]: 'Resource deleted',
      [AuditAction.READ]: 'Resource accessed',
      [AuditAction.LOGIN]: 'User logged in',
      [AuditAction.LOGOUT]: 'User logged out',
      [AuditAction.FAILED_LOGIN]: 'Failed login attempt',
      [AuditAction.PERMISSION_DENIED]: 'Permission denied',
      [AuditAction.PASSWORD_CHANGE]: 'Password changed',
      [AuditAction.EMAIL_CHANGE]: 'Email changed',
      [AuditAction.ROLE_CHANGE]: 'Role changed',
      [AuditAction.DATA_EXPORT]: 'Data exported',
      [AuditAction.SENSITIVE_DATA_ACCESS]: 'Sensitive data accessed',
      [AuditAction.CONFIGURATION_CHANGE]: 'Configuration changed',
      [AuditAction.CUSTOM]: 'Custom action',
    };

    return descriptions[action] || 'Unknown action';
  }
}