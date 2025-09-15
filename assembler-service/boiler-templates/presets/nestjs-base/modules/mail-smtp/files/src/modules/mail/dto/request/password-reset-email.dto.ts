import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsUrl } from 'class-validator';

export class PasswordResetEmailDto {
  @ApiProperty({
    description: 'Recipient email address',
    example: 'user@example.com',
  })
  @IsEmail()
  readonly to: string;

  @ApiProperty({
    description: 'Password reset token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  readonly resetToken: string;

  @ApiPropertyOptional({
    description: 'Custom sender email address',
    example: 'security@example.com',
  })
  @IsOptional()
  @IsEmail()
  readonly from?: string;

  @ApiPropertyOptional({
    description: 'Custom reset URL base',
    example: 'https://yourapp.com/reset-password',
  })
  @IsOptional()
  @IsUrl()
  readonly resetUrlBase?: string;

  @ApiPropertyOptional({
    description: 'Token expiration time in minutes',
    example: 30,
  })
  @IsOptional()
  readonly expirationMinutes?: number;

  @ApiPropertyOptional({
    description: 'User name for personalization',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  readonly userName?: string;
}