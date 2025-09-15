import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuditLogResponseDto } from './audit-log.response.dto';

export class ExportResponseDto {
  @ApiProperty({
    description: 'Export format used',
    enum: ['json', 'csv'],
    example: 'json',
  })
  readonly format: 'json' | 'csv';

  @ApiProperty({
    description: 'Number of records in the export',
    example: 150,
  })
  readonly recordCount: number;

  @ApiProperty({
    description: 'Timestamp when the export was generated',
    example: '2025-09-15T22:30:00.000Z',
    format: 'date-time',
  })
  readonly exportDate: string;

  @ApiProperty({
    description: 'Exported audit log data',
    oneOf: [
      { type: 'array', items: { $ref: '#/components/schemas/AuditLogResponseDto' } },
      { type: 'string', description: 'CSV formatted data' }
    ],
  })
  readonly data: AuditLogResponseDto[] | string;

  @ApiPropertyOptional({
    description: 'Export filters applied',
    example: {
      action: 'LOGIN',
      level: 'MEDIUM',
      fromDate: '2025-01-01T00:00:00.000Z',
      toDate: '2025-12-31T23:59:59.999Z'
    },
  })
  readonly filters?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Export metadata',
    example: {
      exportId: 'exp_123456789',
      requestedBy: 'admin_user',
      fileSize: '2.5MB'
    },
  })
  readonly metadata?: Record<string, any>;
}

export class ArchiveResponseDto {
  @ApiProperty({
    description: 'Number of audit logs archived',
    example: 150,
  })
  readonly archivedCount: number;

  @ApiProperty({
    description: 'Success message',
    example: 'Successfully archived 150 audit logs',
  })
  readonly message: string;

  @ApiProperty({
    description: 'Timestamp when archiving was performed',
    example: '2025-09-15T22:30:00.000Z',
    format: 'date-time',
  })
  readonly archivedAt: string;

  @ApiPropertyOptional({
    description: 'Criteria used for archiving',
    example: {
      olderThan: '2024-01-01T00:00:00.000Z',
      retentionPeriodDays: 365
    },
  })
  readonly archiveCriteria?: Record<string, any>;
}

export class DeleteResponseDto {
  @ApiProperty({
    description: 'Number of archived audit logs deleted',
    example: 75,
  })
  readonly deletedCount: number;

  @ApiProperty({
    description: 'Success message',
    example: 'Successfully deleted 75 archived audit logs',
  })
  readonly message: string;

  @ApiProperty({
    description: 'Timestamp when deletion was performed',
    example: '2025-09-15T22:30:00.000Z',
    format: 'date-time',
  })
  readonly deletedAt: string;

  @ApiPropertyOptional({
    description: 'Warning message about data permanence',
    example: 'This action is permanent and cannot be undone',
  })
  readonly warning?: string;
}