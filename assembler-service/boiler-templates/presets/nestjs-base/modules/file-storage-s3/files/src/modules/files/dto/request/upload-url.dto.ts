import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class UploadUrlDto {
  @ApiProperty({
    description: 'File key/path in S3',
    example: 'uploads/documents/contract.pdf',
  })
  @IsString()
  readonly key: string;

  @ApiProperty({
    description: 'MIME type of the file',
    example: 'application/pdf',
  })
  @IsString()
  readonly contentType: string;

  @ApiPropertyOptional({
    description: 'URL expiration time in seconds',
    example: 3600,
    minimum: 60,
    maximum: 604800, // 7 days
    default: 3600,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(60)
  @Max(604800)
  readonly expiresIn?: number = 3600;
}