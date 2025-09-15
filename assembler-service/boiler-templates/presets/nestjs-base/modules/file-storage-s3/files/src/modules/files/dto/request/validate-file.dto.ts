import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsArray, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class ValidateFileDto {
  @ApiProperty({
    description: 'Name of the file including extension',
    example: 'document.pdf',
  })
  @IsString()
  readonly filename: string;

  @ApiProperty({
    description: 'Size of the file in bytes',
    example: 1024000,
    minimum: 1,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  readonly size: number;

  @ApiPropertyOptional({
    description: 'Array of allowed file extensions',
    example: ['.pdf', '.doc', '.docx', '.txt'],
    type: [String],
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map(ext => ext.trim());
    }
    return value;
  })
  @IsArray()
  @IsString({ each: true })
  readonly allowedTypes?: string[];

  @ApiPropertyOptional({
    description: 'Maximum file size in bytes',
    example: 10485760, // 10MB
    minimum: 1,
    default: 10485760,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  readonly maxSize?: number = 10 * 1024 * 1024; // 10MB
}