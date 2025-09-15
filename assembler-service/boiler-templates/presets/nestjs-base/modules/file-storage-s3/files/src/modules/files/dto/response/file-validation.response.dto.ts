import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FileValidationResponseDto {
  @ApiProperty({
    description: 'Whether the file passes validation',
    example: true,
  })
  readonly valid: boolean;

  @ApiProperty({
    description: 'List of validation errors (empty if valid)',
    example: ['File size exceeds maximum allowed', 'File type not allowed'],
    type: [String],
  })
  readonly errors: string[];

  @ApiProperty({
    description: 'Detected MIME type of the file',
    example: 'application/pdf',
  })
  readonly contentType: string;

  @ApiProperty({
    description: 'File extension detected from filename',
    example: '.pdf',
  })
  readonly fileExtension: string;

  @ApiProperty({
    description: 'File size validation result',
    example: {
      size: 1024000,
      formattedSize: '1.0 MB',
      maxAllowed: 10485760,
      formattedMaxAllowed: '10.0 MB',
      valid: true
    },
  })
  readonly sizeValidation: {
    size: number;
    formattedSize: string;
    maxAllowed: number;
    formattedMaxAllowed: string;
    valid: boolean;
  };

  @ApiProperty({
    description: 'File type validation result',
    example: {
      detectedType: 'application/pdf',
      allowedTypes: ['.pdf', '.doc', '.docx'],
      valid: true
    },
  })
  readonly typeValidation: {
    detectedType: string;
    allowedTypes?: string[];
    valid: boolean;
  };

  @ApiPropertyOptional({
    description: 'Security scan results (if applicable)',
    example: {
      scanned: true,
      safe: true,
      threats: []
    },
  })
  readonly securityScan?: {
    scanned: boolean;
    safe: boolean;
    threats: string[];
  };

  @ApiProperty({
    description: 'Suggested filename for the file',
    example: 'document.pdf',
  })
  readonly suggestedFilename: string;

  @ApiPropertyOptional({
    description: 'Additional validation metadata',
    example: { validationId: 'val_123456789' },
  })
  readonly metadata?: Record<string, any>;
}