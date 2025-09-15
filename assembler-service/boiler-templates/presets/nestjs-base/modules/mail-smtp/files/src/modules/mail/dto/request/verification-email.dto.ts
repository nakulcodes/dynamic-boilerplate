import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsUrl } from 'class-validator';

export class VerificationEmailDto {
  @ApiProperty({
    description: 'Recipient email address',
    example: 'user@example.com',
  })
  @IsEmail()
  readonly to: string;

  @ApiProperty({
    description: 'Email verification token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  readonly verificationToken: string;

  @ApiPropertyOptional({
    description: 'Custom sender email address',
    example: 'verify@example.com',
  })
  @IsOptional()
  @IsEmail()
  readonly from?: string;

  @ApiPropertyOptional({
    description: 'Custom verification URL base',
    example: 'https://yourapp.com/verify-email',
  })
  @IsOptional()
  @IsUrl()
  readonly verificationUrlBase?: string;

  @ApiPropertyOptional({
    description: 'User name for personalization',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  readonly userName?: string;

  @ApiPropertyOptional({
    description: 'Whether this is a resend verification',
    example: false,
  })
  @IsOptional()
  readonly isResend?: boolean;
}