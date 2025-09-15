import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional } from 'class-validator';

export class WelcomeEmailDto {
  @ApiProperty({
    description: 'Recipient email address',
    example: 'user@example.com',
  })
  @IsEmail()
  readonly to: string;

  @ApiProperty({
    description: 'Recipient name',
    example: 'John Doe',
  })
  @IsString()
  readonly name: string;

  @ApiPropertyOptional({
    description: 'Custom sender email address',
    example: 'welcome@example.com',
  })
  @IsOptional()
  @IsEmail()
  readonly from?: string;

  @ApiPropertyOptional({
    description: 'Additional welcome message',
    example: 'Welcome to our premium service!',
  })
  @IsOptional()
  @IsString()
  readonly customMessage?: string;

  @ApiPropertyOptional({
    description: 'User role or subscription type',
    example: 'premium',
  })
  @IsOptional()
  @IsString()
  readonly userRole?: string;
}