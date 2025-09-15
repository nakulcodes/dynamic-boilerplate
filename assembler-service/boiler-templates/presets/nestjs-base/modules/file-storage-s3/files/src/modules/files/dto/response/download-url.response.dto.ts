import { ApiProperty } from '@nestjs/swagger';

export class DownloadUrlResponseDto {
  @ApiProperty({
    description: 'Presigned URL for downloading the file',
    example: 'https://presigned-download-url.com/file.pdf?signature=abc123',
  })
  readonly url: string;

  @ApiProperty({
    description: 'File key/path in S3',
    example: 'uploads/documents/contract.pdf',
  })
  readonly key: string;

  @ApiProperty({
    description: 'URL expiration time in seconds',
    example: 3600,
  })
  readonly expiresIn: number;

  @ApiProperty({
    description: 'Timestamp when the URL expires',
    example: '2025-09-15T23:30:00.000Z',
    format: 'date-time',
  })
  readonly expiresAt: string;

  @ApiProperty({
    description: 'Whether the file exists and is accessible',
    example: true,
  })
  readonly exists: boolean;

  @ApiProperty({
    description: 'Suggested filename for download',
    example: 'contract.pdf',
  })
  readonly filename: string;
}