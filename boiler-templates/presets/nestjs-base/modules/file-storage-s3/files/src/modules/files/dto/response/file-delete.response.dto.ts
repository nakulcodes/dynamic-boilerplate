import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FileDeleteResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'File deleted successfully',
  })
  readonly message: string;

  @ApiProperty({
    description: 'Key of the deleted file',
    example: 'uploads/documents/contract.pdf',
  })
  readonly key: string;

  @ApiProperty({
    description: 'Whether the file was successfully deleted',
    example: true,
  })
  readonly success: boolean;

  @ApiProperty({
    description: 'Timestamp when the file was deleted',
    example: '2025-09-15T22:30:00.000Z',
    format: 'date-time',
  })
  readonly deletedAt: string;

  @ApiPropertyOptional({
    description: 'Additional information about the deletion',
    example: {
      versionId: 'abc123',
      permanent: true
    },
  })
  readonly metadata?: {
    versionId?: string;
    permanent?: boolean;
    [key: string]: any;
  };

  @ApiPropertyOptional({
    description: 'Warning messages if any',
    example: ['File was public and may still be cached'],
    type: [String],
  })
  readonly warnings?: string[];
}