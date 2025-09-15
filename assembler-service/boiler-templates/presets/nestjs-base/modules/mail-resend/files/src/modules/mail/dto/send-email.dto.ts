import { IsString, IsEmail, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendEmailDto {
  @ApiProperty({
    description: 'Recipient email address or array of addresses',
    example: 'user@example.com',
  })
  @IsString()
  to: string | string[];

  @ApiProperty({
    description: 'Email subject',
    example: 'Welcome to Our Platform',
  })
  @IsString()
  subject: string;

  @ApiPropertyOptional({
    description: 'HTML content of the email',
    example: '<h1>Welcome!</h1><p>Thank you for joining us.</p>',
  })
  @IsOptional()
  @IsString()
  html?: string;

  @ApiPropertyOptional({
    description: 'Plain text content of the email',
    example: 'Welcome! Thank you for joining us.',
  })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiPropertyOptional({
    description: 'Sender email address',
    example: 'noreply@example.com',
  })
  @IsOptional()
  @IsEmail()
  from?: string;

  @ApiPropertyOptional({
    description: 'CC email addresses',
    example: ['cc1@example.com', 'cc2@example.com'],
  })
  @IsOptional()
  cc?: string | string[];

  @ApiPropertyOptional({
    description: 'BCC email addresses',
    example: ['bcc1@example.com', 'bcc2@example.com'],
  })
  @IsOptional()
  bcc?: string | string[];
}