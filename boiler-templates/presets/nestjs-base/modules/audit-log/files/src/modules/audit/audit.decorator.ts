import { SetMetadata, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuditAction, AuditLevel } from '@db/entities/audit-log.entity';

export const AUDIT_METADATA_KEY = 'audit';

export interface AuditMetadata {
  action: AuditAction;
  level: AuditLevel;
  description?: string;
  resourceType?: string;
  skipIf?: (context: ExecutionContext) => boolean;
  extractResourceId?: (context: ExecutionContext) => string | undefined;
  extractUserId?: (context: ExecutionContext) => string | undefined;
  includeRequest?: boolean;
  includeResponse?: boolean;
  sensitiveFields?: string[];
}

/**
 * Decorator to enable audit logging for a method
 *
 * @param options - Audit configuration options
 *
 * @example
 * ```typescript
 * @Audit({
 *   action: AuditAction.UPDATE,
 *   level: AuditLevel.HIGH,
 *   description: 'User profile updated',
 *   resourceType: 'User',
 *   extractResourceId: (ctx) => ctx.switchToHttp().getRequest().params.id,
 *   sensitiveFields: ['password', 'ssn']
 * })
 * async updateUser(id: string, updateData: UpdateUserDto) {
 *   // method implementation
 * }
 * ```
 */
export const Audit = (options: AuditMetadata): MethodDecorator => {
  return SetMetadata(AUDIT_METADATA_KEY, options);
};

/**
 * Parameter decorator to inject audit context into method parameters
 *
 * @example
 * ```typescript
 * async someMethod(@AuditContext() auditCtx: AuditContextData) {
 *   console.log('Correlation ID:', auditCtx.correlationId);
 * }
 * ```
 */
export const AuditContext = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return {
      correlationId: request.correlationId,
      sessionId: request.sessionId,
      userId: request.user?.id,
      username: request.user?.username,
      ipAddress: request.ip || request.connection?.remoteAddress,
      userAgent: request.get('User-Agent'),
    };
  }
);

/**
 * Shorthand decorators for common audit scenarios
 */

export const AuditCreate = (resourceType: string, description?: string) =>
  Audit({
    action: AuditAction.CREATE,
    level: AuditLevel.MEDIUM,
    description: description || `Created ${resourceType}`,
    resourceType,
    includeRequest: true,
    includeResponse: true,
  });

export const AuditUpdate = (resourceType: string, description?: string) =>
  Audit({
    action: AuditAction.UPDATE,
    level: AuditLevel.MEDIUM,
    description: description || `Updated ${resourceType}`,
    resourceType,
    includeRequest: true,
    extractResourceId: (ctx) => ctx.switchToHttp().getRequest().params.id,
  });

export const AuditDelete = (resourceType: string, description?: string) =>
  Audit({
    action: AuditAction.DELETE,
    level: AuditLevel.HIGH,
    description: description || `Deleted ${resourceType}`,
    resourceType,
    extractResourceId: (ctx) => ctx.switchToHttp().getRequest().params.id,
  });

export const AuditRead = (resourceType: string, description?: string) =>
  Audit({
    action: AuditAction.READ,
    level: AuditLevel.LOW,
    description: description || `Read ${resourceType}`,
    resourceType,
    extractResourceId: (ctx) => ctx.switchToHttp().getRequest().params.id,
  });

export const AuditSensitive = (description: string, sensitiveFields: string[] = []) =>
  Audit({
    action: AuditAction.SENSITIVE_DATA_ACCESS,
    level: AuditLevel.CRITICAL,
    description,
    includeRequest: true,
    sensitiveFields,
  });

export const AuditLogin = () =>
  Audit({
    action: AuditAction.LOGIN,
    level: AuditLevel.MEDIUM,
    description: 'User login attempt',
    includeRequest: true,
  });

export const AuditLogout = () =>
  Audit({
    action: AuditAction.LOGOUT,
    level: AuditLevel.LOW,
    description: 'User logout',
  });

export const AuditFailedLogin = () =>
  Audit({
    action: AuditAction.FAILED_LOGIN,
    level: AuditLevel.HIGH,
    description: 'Failed login attempt',
    includeRequest: true,
  });

export const AuditPasswordChange = () =>
  Audit({
    action: AuditAction.PASSWORD_CHANGE,
    level: AuditLevel.HIGH,
    description: 'Password changed',
    sensitiveFields: ['password', 'newPassword', 'oldPassword'],
  });

export const AuditEmailChange = () =>
  Audit({
    action: AuditAction.EMAIL_CHANGE,
    level: AuditLevel.MEDIUM,
    description: 'Email address changed',
    includeRequest: true,
  });

export const AuditRoleChange = () =>
  Audit({
    action: AuditAction.ROLE_CHANGE,
    level: AuditLevel.CRITICAL,
    description: 'User role or permissions changed',
    includeRequest: true,
    includeResponse: true,
  });

export const AuditDataExport = (resourceType: string) =>
  Audit({
    action: AuditAction.DATA_EXPORT,
    level: AuditLevel.HIGH,
    description: `Data export: ${resourceType}`,
    resourceType,
    includeRequest: true,
  });

export const AuditConfigChange = (description?: string) =>
  Audit({
    action: AuditAction.CONFIGURATION_CHANGE,
    level: AuditLevel.CRITICAL,
    description: description || 'System configuration changed',
    includeRequest: true,
    includeResponse: true,
  });