import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FileUploadResponseDto {
  @ApiProperty({
    description: 'Unique key/path of the uploaded file in S3',
    example: 'uploads/123e4567-e89b-12d3-a456-426614174000.jpg',
  })
  readonly key: string;

  @ApiProperty({
    description: 'Presigned URL for accessing the file',
    example: 'https://presigned-url.com/file.jpg?signature=abc123',
  })
  readonly url: string;

  @ApiPropertyOptional({
    description: 'Public URL if file was made public',
    example: 'https://bucket.s3.region.amazonaws.com/uploads/file.jpg',
  })
  readonly publicUrl?: string;

  @ApiProperty({
    description: 'S3 bucket name where file was stored',
    example: 'my-app-files',
  })
  readonly bucket: string;

  @ApiProperty({
    description: 'MIME type of the uploaded file',
    example: 'image/jpeg',
  })
  readonly contentType: string;

  @ApiProperty({
    description: 'Size of the uploaded file in bytes',
    example: 1024000,
  })
  readonly size: number;

  @ApiPropertyOptional({
    description: 'Original filename provided during upload',
    example: 'my-image.jpg',
  })
  readonly originalName?: string;

  @ApiProperty({
    description: 'Timestamp when the file was uploaded',
    example: '2025-09-15T22:30:00.000Z',
    format: 'date-time',
  })
  readonly uploadedAt: string;

  @ApiPropertyOptional({
    description: 'ETag of the uploaded file',
    example: '"abc123def456"',
  })
  readonly etag?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata about the upload',
    example: { folder: 'documents', userId: '123' },
  })
  readonly metadata?: Record<string, any>;
}