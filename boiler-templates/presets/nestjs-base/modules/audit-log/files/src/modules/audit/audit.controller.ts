import {
  Controller,
  Get,
  Query,
  Param,
  Post,
  Delete,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuditLogRepository, AuditLogFilters, PaginationOptions } from '@db/repositories/audit-log.repository';
import { AuditService } from './audit.service';
import { AuditAction, AuditLevel } from '@db/entities/audit-log.entity';
import {
  SearchAuditLogDto,
  CriticalEventsDto,
  FailedAttemptsDto,
  StatisticsDto,
  ExportAuditLogDto,
  PaginatedAuditLogResponseDto,
  AuditLogResponseDto,
  AuditStatisticsResponseDto,
  ExportResponseDto,
  ArchiveResponseDto,
  DeleteResponseDto,
} from './dto';

// Note: Add your authentication/authorization guards here
// @UseGuards(JwtAuthGuard, RolesGuard)
// @Roles('admin', 'auditor')
@ApiTags('audit')
@Controller('audit')
export class AuditController {
  constructor(
    private readonly auditRepository: AuditLogRepository,
    private readonly auditService: AuditService,
  ) {}

  @Get('logs')
  @ApiOperation({ summary: 'Search audit logs with filters and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Audit logs retrieved successfully',
    type: PaginatedAuditLogResponseDto,
  })
  async searchAuditLogs(
    @Query() searchDto: SearchAuditLogDto,
  ): Promise<PaginatedAuditLogResponseDto> {
    const filters: AuditLogFilters = {
      userId: searchDto.userId,
      action: searchDto.action,
      level: searchDto.level,
      resourceType: searchDto.resourceType,
      resourceId: searchDto.resourceId,
      fromDate: searchDto.fromDate ? new Date(searchDto.fromDate) : undefined,
      toDate: searchDto.toDate ? new Date(searchDto.toDate) : undefined,
      ipAddress: searchDto.ipAddress,
      archived: searchDto.archived,
    };

    const pagination: PaginationOptions = {
      page: searchDto.page || 1,
      limit: Math.min(searchDto.limit || 50, 100)
    };

    return this.auditRepository.findAuditLogs(filters, pagination);
  }

  @Get('logs/:id')
  @ApiOperation({ summary: 'Get audit log by ID' })
  @ApiResponse({
    status: 200,
    description: 'Audit log retrieved successfully',
    type: AuditLogResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Audit log not found',
  })
  async getAuditLog(@Param('id', ParseUUIDPipe) id: string): Promise<AuditLogResponseDto> {
    return this.auditRepository.findOne({ where: { id } });
  }

  @Get('correlation/:correlationId')
  @ApiOperation({ summary: 'Get audit logs by correlation ID' })
  @ApiResponse({
    status: 200,
    description: 'Audit logs retrieved successfully',
    type: [AuditLogResponseDto],
  })
  async getAuditLogsByCorrelation(@Param('correlationId') correlationId: string): Promise<AuditLogResponseDto[]> {
    return this.auditRepository.findByCorrelationId(correlationId);
  }

  @Get('session/:sessionId')
  @ApiOperation({ summary: 'Get audit logs by session ID' })
  @ApiResponse({
    status: 200,
    description: 'Audit logs retrieved successfully',
    type: [AuditLogResponseDto],
  })
  async getAuditLogsBySession(@Param('sessionId') sessionId: string): Promise<AuditLogResponseDto[]> {
    return this.auditRepository.findBySessionId(sessionId);
  }

  @Get('critical')
  @ApiOperation({ summary: 'Get critical audit events' })
  @ApiResponse({
    status: 200,
    description: 'Critical audit events retrieved successfully',
    type: [AuditLogResponseDto],
  })
  async getCriticalEvents(
    @Query() criticalEventsDto: CriticalEventsDto,
  ): Promise<AuditLogResponseDto[]> {
    return this.auditRepository.findCriticalEvents(
      criticalEventsDto.fromDate ? new Date(criticalEventsDto.fromDate) : undefined,
      criticalEventsDto.toDate ? new Date(criticalEventsDto.toDate) : undefined,
    );
  }

  @Get('failed-attempts')
  @ApiOperation({ summary: 'Get failed authentication/authorization attempts' })
  @ApiResponse({
    status: 200,
    description: 'Failed attempts retrieved successfully',
    type: [AuditLogResponseDto],
  })
  async getFailedAttempts(
    @Query() failedAttemptsDto: FailedAttemptsDto,
  ): Promise<AuditLogResponseDto[]> {
    return this.auditRepository.findFailedAttempts(
      failedAttemptsDto.userId,
      failedAttemptsDto.fromDate ? new Date(failedAttemptsDto.fromDate) : undefined,
      Math.min(failedAttemptsDto.limit || 10, 100),
    );
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get audit statistics' })
  @ApiResponse({
    status: 200,
    description: 'Audit statistics retrieved successfully',
    type: AuditStatisticsResponseDto,
  })
  async getStatistics(
    @Query() statisticsDto: StatisticsDto,
  ): Promise<AuditStatisticsResponseDto> {
    return this.auditRepository.getAuditStatistics(
      statisticsDto.fromDate ? new Date(statisticsDto.fromDate) : undefined,
      statisticsDto.toDate ? new Date(statisticsDto.toDate) : undefined,
    );
  }

  @Get('export')
  @ApiOperation({ summary: 'Export audit logs' })
  @ApiResponse({
    status: 200,
    description: 'Audit logs exported successfully',
    type: ExportResponseDto,
  })
  async exportAuditLogs(
    @Query() exportDto: ExportAuditLogDto,
  ): Promise<ExportResponseDto> {
    const filters: AuditLogFilters = {
      userId: exportDto.userId,
      action: exportDto.action,
      level: exportDto.level,
      resourceType: exportDto.resourceType,
      resourceId: exportDto.resourceId,
      fromDate: exportDto.fromDate ? new Date(exportDto.fromDate) : undefined,
      toDate: exportDto.toDate ? new Date(exportDto.toDate) : undefined,
      ipAddress: exportDto.ipAddress,
      archived: exportDto.archived,
    };

    const logs = await this.auditRepository.exportAuditLogs(filters, exportDto.format || 'json');

    // Log the data export action
    await this.auditService.logDataAccess(
      AuditAction.DATA_EXPORT,
      'AuditLog',
      undefined,
      undefined, // Extract from auth context
      undefined, // Extract from auth context
      { filters, format: exportDto.format || 'json', recordCount: logs.length },
    );

    return {
      format: exportDto.format || 'json',
      recordCount: logs.length,
      exportDate: new Date().toISOString(),
      data: logs,
      filters,
      metadata: {
        exportId: `exp_${Date.now()}`,
        requestedBy: 'system', // Extract from auth context
        fileSize: JSON.stringify(logs).length + ' bytes',
      },
    };
  }

  @Post('archive')
  @ApiOperation({ summary: 'Archive old audit logs based on retention policy' })
  @ApiResponse({
    status: 200,
    description: 'Audit logs archived successfully',
    type: ArchiveResponseDto,
  })
  async archiveOldLogs(): Promise<ArchiveResponseDto> {
    const archivedCount = await this.auditService.archiveOldLogs();

    return {
      archivedCount,
      message: `Successfully archived ${archivedCount} audit logs`,
      archivedAt: new Date().toISOString(),
      archiveCriteria: {
        retentionPeriodDays: 365,
        olderThan: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
      },
    };
  }

  @Delete('archived')
  @ApiOperation({ summary: 'Delete archived audit logs (use with caution)' })
  @ApiResponse({
    status: 200,
    description: 'Archived audit logs deleted successfully',
    type: DeleteResponseDto,
  })
  async deleteArchivedLogs(): Promise<DeleteResponseDto> {
    const deletedCount = await this.auditService.deleteArchivedLogs();

    return {
      deletedCount,
      message: `Successfully deleted ${deletedCount} archived audit logs`,
      deletedAt: new Date().toISOString(),
      warning: 'This action is permanent and cannot be undone',
    };
  }
}