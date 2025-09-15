import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FileMetadataResponseDto {
  @ApiProperty({
    description: 'File key/path in S3',
    example: 'uploads/documents/contract.pdf',
  })
  readonly key: string;

  @ApiProperty({
    description: 'S3 bucket name',
    example: 'my-app-files',
  })
  readonly bucket: string;

  @ApiProperty({
    description: 'MIME type of the file',
    example: 'application/pdf',
  })
  readonly contentType: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 1024000,
  })
  readonly size: number;

  @ApiProperty({
    description: 'Last modified timestamp',
    example: '2025-09-15T22:30:00.000Z',
    format: 'date-time',
  })
  readonly lastModified: string;

  @ApiProperty({
    description: 'ETag of the file',
    example: '"abc123def456"',
  })
  readonly etag: string;

  @ApiProperty({
    description: 'Presigned URL for accessing the file',
    example: 'https://presigned-url.com/file.pdf?signature=abc123',
  })
  readonly url: string;

  @ApiPropertyOptional({
    description: 'Public URL if file is publicly accessible',
    example: 'https://bucket.s3.region.amazonaws.com/uploads/file.pdf',
  })
  readonly publicUrl?: string;

  @ApiPropertyOptional({
    description: 'Storage class of the file',
    example: 'STANDARD',
  })
  readonly storageClass?: string;

  @ApiPropertyOptional({
    description: 'Server-side encryption information',
    example: 'AES256',
  })
  readonly encryption?: string;

  @ApiPropertyOptional({
    description: 'Custom metadata associated with the file',
    example: { uploadedBy: 'user123', department: 'legal' },
  })
  readonly metadata?: Record<string, any>;

  @ApiProperty({
    description: 'Whether the file exists and is accessible',
    example: true,
  })
  readonly exists: boolean;

  @ApiProperty({
    description: 'Human-readable file size',
    example: '1.0 MB',
  })
  readonly formattedSize: string;
}