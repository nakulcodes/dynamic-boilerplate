import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class DownloadUrlDto {
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