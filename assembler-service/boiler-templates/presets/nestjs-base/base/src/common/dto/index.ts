// Base DTOs for common patterns
export * from './pagination.dto';
export * from './date-range.dto';
export * from './filter.dto';
export * from './response.dto';

// New standardized response DTOs and interfaces
export * from './response/api-response.dto';
export * from '../interfaces/api-response.interface';

// Re-export commonly used decorators and classes
export { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export { IsOptional, IsString, IsNumber, IsBoolean, IsUUID, IsEmail, IsEnum, IsArray, IsDateString, IsIP } from 'class-validator';
export { Transform, Type } from 'class-transformer';