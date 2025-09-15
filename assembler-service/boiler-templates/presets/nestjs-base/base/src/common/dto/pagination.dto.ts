import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsPositive, IsInt, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class PaginationDto {
  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  readonly page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 50,
    minimum: 1,
    maximum: 100,
    default: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  readonly limit?: number = 50;

  @ApiPropertyOptional({
    description: 'Offset for pagination (alternative to page)',
    example: 0,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  readonly offset?: number;

  @ApiPropertyOptional({
    description: 'Sort by field',
    example: 'createdAt',
  })
  @IsOptional()
  readonly sortBy?: string;

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @Transform(({ value }) => value?.toUpperCase())
  readonly sortOrder?: 'ASC' | 'DESC' = 'DESC';
}