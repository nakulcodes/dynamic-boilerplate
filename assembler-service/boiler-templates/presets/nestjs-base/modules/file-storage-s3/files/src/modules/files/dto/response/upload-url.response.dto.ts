import { ApiProperty } from '@nestjs/swagger';

export class UploadUrlResponseDto {
  @ApiProperty({
    description: 'Presigned URL for direct file upload',
    example: 'https://presigned-upload-url.com?signature=abc123',
  })
  readonly uploadUrl: string;

  @ApiProperty({
    description: 'File key/path that will be used in S3',
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
    description: 'Instructions for using the presigned URL',
    example: 'Use PUT method to upload file directly to this URL',
  })
  readonly instructions: string;

  @ApiProperty({
    description: 'Maximum file size allowed for this upload',
    example: 10485760,
  })
  readonly maxFileSize: number;
}