import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class UploadFileDto {
  @ApiPropertyOptional({
    description: 'Optional folder path for organizing files',
    example: 'documents/contracts',
  })
  @IsOptional()
  @IsString()
  readonly folder?: string;

  @ApiPropertyOptional({
    description: 'Custom filename (without extension)',
    example: 'my-custom-file-name',
  })
  @IsOptional()
  @IsString()
  readonly filename?: string;

  @ApiPropertyOptional({
    description: 'Make file publicly accessible',
    example: false,
    default: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  readonly makePublic?: boolean = false;
}