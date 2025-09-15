import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { MailService, SendEmailOptions } from './mail.service';
import {
  SendEmailDto,
  WelcomeEmailDto,
  PasswordResetEmailDto,
  VerificationEmailDto,
  EmailSendResponseDto,
} from './dto';

@ApiTags('mail')
@Controller('mail')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MailController {
  constructor(private mailService: MailService) {}

  @Get('test-connection')
  @ApiOperation({ summary: 'Test SMTP connection' })
  @ApiResponse({ status: 200, description: 'Connection test result', schema: { example: { success: true, message: 'SMTP connection successful' } } })
  async testConnection() {
    const isConnected = await this.mailService.verifyConnection();
    return {
      success: isConnected,
      message: isConnected ? 'SMTP connection successful' : 'SMTP connection failed',
    };
  }

  @Post('send')
  @ApiOperation({ summary: 'Send an email' })
  @ApiResponse({ status: 200, description: 'Email sent successfully', type: EmailSendResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid email data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async sendEmail(@Body() sendEmailDto: SendEmailDto): Promise<EmailSendResponseDto> {
    const options: SendEmailOptions = {
      to: sendEmailDto.to,
      subject: sendEmailDto.subject,
      html: sendEmailDto.html,
      text: sendEmailDto.text,
      from: sendEmailDto.from,
      cc: sendEmailDto.cc,
      bcc: sendEmailDto.bcc,
    };

    const result = await this.mailService.sendEmail(options);
    return {
      success: true,
      messageId: result.messageId,
      message: 'Email sent successfully',
      serviceResponse: { messageId: result.messageId },
      sentAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 60000).toISOString(), // +60 seconds estimate for SMTP
      metadata: {
        to: sendEmailDto.to,
        subject: sendEmailDto.subject,
        provider: 'smtp',
      },
      tracking: result.messageId ? {
        trackingId: result.messageId,
      } : undefined,
    };
  }

  @Post('welcome')
  @ApiOperation({ summary: 'Send welcome email' })
  @ApiResponse({ status: 200, description: 'Welcome email sent successfully', type: EmailSendResponseDto })
  async sendWelcomeEmail(@Body() welcomeDto: WelcomeEmailDto): Promise<EmailSendResponseDto> {
    const result = await this.mailService.sendWelcomeEmail(welcomeDto.to, welcomeDto.name);
    return {
      success: true,
      messageId: result.messageId,
      message: 'Welcome email sent successfully',
      serviceResponse: { messageId: result.messageId },
      sentAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 60000).toISOString(),
      metadata: {
        to: welcomeDto.to,
        subject: 'Welcome to Our Platform',
        template: 'welcome',
        provider: 'smtp',
        userRole: welcomeDto.userRole,
        customMessage: welcomeDto.customMessage,
      },
      tracking: result.messageId ? {
        trackingId: result.messageId,
      } : undefined,
    };
  }

  @Post('password-reset')
  @ApiOperation({ summary: 'Send password reset email' })
  @ApiResponse({ status: 200, description: 'Password reset email sent successfully', type: EmailSendResponseDto })
  async sendPasswordResetEmail(@Body() resetDto: PasswordResetEmailDto): Promise<EmailSendResponseDto> {
    const result = await this.mailService.sendPasswordResetEmail(resetDto.to, resetDto.resetToken);
    return {
      success: true,
      messageId: result.messageId,
      message: 'Password reset email sent successfully',
      serviceResponse: { messageId: result.messageId },
      sentAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 60000).toISOString(),
      metadata: {
        to: resetDto.to,
        subject: 'Password Reset Request',
        template: 'password_reset',
        provider: 'smtp',
        expirationMinutes: resetDto.expirationMinutes || 30,
        userName: resetDto.userName,
      },
      tracking: result.messageId ? {
        trackingId: result.messageId,
      } : undefined,
    };
  }

  @Post('verification')
  @ApiOperation({ summary: 'Send email verification' })
  @ApiResponse({ status: 200, description: 'Verification email sent successfully', type: EmailSendResponseDto })
  async sendVerificationEmail(@Body() verificationDto: VerificationEmailDto): Promise<EmailSendResponseDto> {
    const result = await this.mailService.sendVerificationEmail(verificationDto.to, verificationDto.verificationToken);
    return {
      success: true,
      messageId: result.messageId,
      message: 'Verification email sent successfully',
      serviceResponse: { messageId: result.messageId },
      sentAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 60000).toISOString(),
      metadata: {
        to: verificationDto.to,
        subject: 'Email Verification',
        template: 'email_verification',
        provider: 'smtp',
        isResend: verificationDto.isResend || false,
        userName: verificationDto.userName,
      },
      tracking: result.messageId ? {
        trackingId: result.messageId,
      } : undefined,
    };
  }
}