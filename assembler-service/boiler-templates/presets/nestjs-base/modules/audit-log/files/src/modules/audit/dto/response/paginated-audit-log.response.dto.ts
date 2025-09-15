import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponseDto, PaginationMetaDto } from '@common/dto';
import { AuditLogResponseDto } from './audit-log.response.dto';

export class PaginatedAuditLogResponseDto {
  @ApiProperty({
    description: 'List of audit logs',
    type: [AuditLogResponseDto],
  })
  readonly logs: AuditLogResponseDto[];

  @ApiProperty({
    description: 'Total number of audit logs matching the criteria',
    example: 1000,
  })
  readonly total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  readonly page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 50,
  })
  readonly limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 20,
  })
  readonly totalPages: number;

  @ApiProperty({
    description: 'Whether there is a next page',
    example: true,
  })
  readonly hasNext: boolean;

  @ApiProperty({
    description: 'Whether there is a previous page',
    example: false,
  })
  readonly hasPrevious: boolean;
}

export class AuditLogSearchResponseDto extends PaginatedAuditLogResponseDto {
  @ApiProperty({
    description: 'Search criteria used for filtering',
    example: {
      action: 'LOGIN',
      level: 'MEDIUM',
      fromDate: '2025-01-01T00:00:00.000Z',
      toDate: '2025-12-31T23:59:59.999Z'
    },
  })
  readonly searchCriteria: Record<string, any>;

  @ApiProperty({
    description: 'Timestamp when the search was performed',
    example: '2025-09-15T22:30:00.000Z',
    format: 'date-time',
  })
  readonly searchTimestamp: string;
}