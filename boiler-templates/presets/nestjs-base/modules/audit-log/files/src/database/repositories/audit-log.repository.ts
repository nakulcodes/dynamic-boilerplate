import { Repository, DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { AuditLog, AuditAction, AuditLevel } from '../entities/audit-log.entity';

export interface AuditLogFilters {
  userId?: string;
  action?: AuditAction;
  level?: AuditLevel;
  resourceType?: string;
  resourceId?: string;
  fromDate?: Date;
  toDate?: Date;
  ipAddress?: string;
  archived?: boolean;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface AuditLogSearchResult {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class AuditLogRepository extends Repository<AuditLog> {
  constructor(private readonly dataSource: DataSource) {
    super(AuditLog, dataSource.createEntityManager());
  }

  async createAuditLog(auditData: Partial<AuditLog>): Promise<AuditLog> {
    const auditLog = this.create(auditData);
    return this.save(auditLog);
  }

  async findAuditLogs(
    filters: AuditLogFilters = {},
    pagination: PaginationOptions = { page: 1, limit: 50 }
  ): Promise<AuditLogSearchResult> {
    const queryBuilder = this.createQueryBuilder('audit');

    // Apply filters
    if (filters.userId) {
      queryBuilder.andWhere('audit.userId = :userId', { userId: filters.userId });
    }

    if (filters.action) {
      queryBuilder.andWhere('audit.action = :action', { action: filters.action });
    }

    if (filters.level) {
      queryBuilder.andWhere('audit.level = :level', { level: filters.level });
    }

    if (filters.resourceType) {
      queryBuilder.andWhere('audit.resourceType = :resourceType', { resourceType: filters.resourceType });
    }

    if (filters.resourceId) {
      queryBuilder.andWhere('audit.resourceId = :resourceId', { resourceId: filters.resourceId });
    }

    if (filters.fromDate) {
      queryBuilder.andWhere('audit.timestamp >= :fromDate', { fromDate: filters.fromDate });
    }

    if (filters.toDate) {
      queryBuilder.andWhere('audit.timestamp <= :toDate', { toDate: filters.toDate });
    }

    if (filters.ipAddress) {
      queryBuilder.andWhere('audit.ipAddress = :ipAddress', { ipAddress: filters.ipAddress });
    }

    if (filters.archived !== undefined) {
      queryBuilder.andWhere('audit.archived = :archived', { archived: filters.archived });
    }

    // Apply pagination
    const offset = (pagination.page - 1) * pagination.limit;
    queryBuilder.skip(offset).take(pagination.limit);

    // Order by timestamp (newest first)
    queryBuilder.orderBy('audit.timestamp', 'DESC');

    const [logs, total] = await queryBuilder.getManyAndCount();

    return {
      logs,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }

  async findByCorrelationId(correlationId: string): Promise<AuditLog[]> {
    return this.find({
      where: { correlationId },
      order: { timestamp: 'ASC' },
    });
  }

  async findBySessionId(sessionId: string): Promise<AuditLog[]> {
    return this.find({
      where: { sessionId },
      order: { timestamp: 'ASC' },
    });
  }

  async findCriticalEvents(
    fromDate?: Date,
    toDate?: Date
  ): Promise<AuditLog[]> {
    const queryBuilder = this.createQueryBuilder('audit')
      .where('audit.level = :level', { level: AuditLevel.CRITICAL })
      .orderBy('audit.timestamp', 'DESC');

    if (fromDate) {
      queryBuilder.andWhere('audit.timestamp >= :fromDate', { fromDate });
    }

    if (toDate) {
      queryBuilder.andWhere('audit.timestamp <= :toDate', { toDate });
    }

    return queryBuilder.getMany();
  }

  async findFailedAttempts(
    userId?: string,
    fromDate?: Date,
    limit: number = 10
  ): Promise<AuditLog[]> {
    const queryBuilder = this.createQueryBuilder('audit')
      .where('audit.action IN (:...actions)', {
        actions: [AuditAction.FAILED_LOGIN, AuditAction.PERMISSION_DENIED]
      })
      .orderBy('audit.timestamp', 'DESC')
      .limit(limit);

    if (userId) {
      queryBuilder.andWhere('audit.userId = :userId', { userId });
    }

    if (fromDate) {
      queryBuilder.andWhere('audit.timestamp >= :fromDate', { fromDate });
    }

    return queryBuilder.getMany();
  }

  async getAuditStatistics(
    fromDate?: Date,
    toDate?: Date
  ): Promise<{
    totalLogs: number;
    logsByAction: Record<string, number>;
    logsByLevel: Record<string, number>;
    uniqueUsers: number;
    failedAttempts: number;
  }> {
    const queryBuilder = this.createQueryBuilder('audit');

    if (fromDate) {
      queryBuilder.andWhere('audit.timestamp >= :fromDate', { fromDate });
    }

    if (toDate) {
      queryBuilder.andWhere('audit.timestamp <= :toDate', { toDate });
    }

    const [totalLogs, actionStats, levelStats, uniqueUsersResult, failedAttempts] = await Promise.all([
      // Total logs count
      queryBuilder.getCount(),

      // Logs by action
      this.createQueryBuilder('audit')
        .select('audit.action', 'action')
        .addSelect('COUNT(*)', 'count')
        .where(fromDate ? 'audit.timestamp >= :fromDate' : '1=1', fromDate ? { fromDate } : {})
        .andWhere(toDate ? 'audit.timestamp <= :toDate' : '1=1', toDate ? { toDate } : {})
        .groupBy('audit.action')
        .getRawMany(),

      // Logs by level
      this.createQueryBuilder('audit')
        .select('audit.level', 'level')
        .addSelect('COUNT(*)', 'count')
        .where(fromDate ? 'audit.timestamp >= :fromDate' : '1=1', fromDate ? { fromDate } : {})
        .andWhere(toDate ? 'audit.timestamp <= :toDate' : '1=1', toDate ? { toDate } : {})
        .groupBy('audit.level')
        .getRawMany(),

      // Unique users
      this.createQueryBuilder('audit')
        .select('COUNT(DISTINCT audit.userId)', 'count')
        .where('audit.userId IS NOT NULL')
        .andWhere(fromDate ? 'audit.timestamp >= :fromDate' : '1=1', fromDate ? { fromDate } : {})
        .andWhere(toDate ? 'audit.timestamp <= :toDate' : '1=1', toDate ? { toDate } : {})
        .getRawOne(),

      // Failed attempts
      this.createQueryBuilder('audit')
        .where('audit.action IN (:...actions)', {
          actions: [AuditAction.FAILED_LOGIN, AuditAction.PERMISSION_DENIED]
        })
        .andWhere(fromDate ? 'audit.timestamp >= :fromDate' : '1=1', fromDate ? { fromDate } : {})
        .andWhere(toDate ? 'audit.timestamp <= :toDate' : '1=1', toDate ? { toDate } : {})
        .getCount(),
    ]);

    const logsByAction: Record<string, number> = {};
    actionStats.forEach((stat: any) => {
      logsByAction[stat.action] = parseInt(stat.count);
    });

    const logsByLevel: Record<string, number> = {};
    levelStats.forEach((stat: any) => {
      logsByLevel[stat.level] = parseInt(stat.count);
    });

    return {
      totalLogs,
      logsByAction,
      logsByLevel,
      uniqueUsers: parseInt(uniqueUsersResult.count),
      failedAttempts,
    };
  }

  async archiveOldLogs(retentionDays: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.update(
      {
        timestamp: { $lt: cutoffDate } as any,
        archived: false,
      },
      { archived: true }
    );

    return result.affected || 0;
  }

  async deleteArchivedLogs(): Promise<number> {
    const result = await this.delete({ archived: true });
    return result.affected || 0;
  }

  async exportAuditLogs(
    filters: AuditLogFilters = {},
    format: 'json' | 'csv' = 'json'
  ): Promise<AuditLog[]> {
    const queryBuilder = this.createQueryBuilder('audit');

    // Apply the same filters as findAuditLogs but without pagination
    if (filters.userId) {
      queryBuilder.andWhere('audit.userId = :userId', { userId: filters.userId });
    }

    if (filters.action) {
      queryBuilder.andWhere('audit.action = :action', { action: filters.action });
    }

    if (filters.level) {
      queryBuilder.andWhere('audit.level = :level', { level: filters.level });
    }

    if (filters.resourceType) {
      queryBuilder.andWhere('audit.resourceType = :resourceType', { resourceType: filters.resourceType });
    }

    if (filters.resourceId) {
      queryBuilder.andWhere('audit.resourceId = :resourceId', { resourceId: filters.resourceId });
    }

    if (filters.fromDate) {
      queryBuilder.andWhere('audit.timestamp >= :fromDate', { fromDate: filters.fromDate });
    }

    if (filters.toDate) {
      queryBuilder.andWhere('audit.timestamp <= :toDate', { toDate: filters.toDate });
    }

    if (filters.ipAddress) {
      queryBuilder.andWhere('audit.ipAddress = :ipAddress', { ipAddress: filters.ipAddress });
    }

    if (filters.archived !== undefined) {
      queryBuilder.andWhere('audit.archived = :archived', { archived: filters.archived });
    }

    queryBuilder.orderBy('audit.timestamp', 'DESC');

    return queryBuilder.getMany();
  }
}