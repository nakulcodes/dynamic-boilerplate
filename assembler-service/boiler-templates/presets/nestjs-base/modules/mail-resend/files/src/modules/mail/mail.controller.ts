import { Controller, Post, Body, UseGuards } from '@nestjs/common';
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
      messageId: result.data?.id,
      message: 'Email sent successfully',
      serviceResponse: result.data,
      sentAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 30000).toISOString(), // +30 seconds estimate
      metadata: {
        to: sendEmailDto.to,
        subject: sendEmailDto.subject,
        provider: 'resend',
      },
      tracking: result.data?.id ? {
        trackingId: result.data.id,
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
      messageId: result.data?.id,
      message: 'Welcome email sent successfully',
      serviceResponse: result.data,
      sentAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 30000).toISOString(),
      metadata: {
        to: welcomeDto.to,
        subject: 'Welcome to Our Platform',
        template: 'welcome',
        provider: 'resend',
        userRole: welcomeDto.userRole,
        customMessage: welcomeDto.customMessage,
      },
      tracking: result.data?.id ? {
        trackingId: result.data.id,
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
      messageId: result.data?.id,
      message: 'Password reset email sent successfully',
      serviceResponse: result.data,
      sentAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 30000).toISOString(),
      metadata: {
        to: resetDto.to,
        subject: 'Password Reset Request',
        template: 'password_reset',
        provider: 'resend',
        expirationMinutes: resetDto.expirationMinutes || 30,
        userName: resetDto.userName,
      },
      tracking: result.data?.id ? {
        trackingId: result.data.id,
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
      messageId: result.data?.id,
      message: 'Verification email sent successfully',
      serviceResponse: result.data,
      sentAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 30000).toISOString(),
      metadata: {
        to: verificationDto.to,
        subject: 'Email Verification',
        template: 'email_verification',
        provider: 'resend',
        isResend: verificationDto.isResend || false,
        userName: verificationDto.userName,
      },
      tracking: result.data?.id ? {
        trackingId: result.data.id,
      } : undefined,
    };
  }
}