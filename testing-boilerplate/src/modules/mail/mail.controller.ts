import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { MailService, SendEmailOptions } from './mail.service';
import { SendEmailDto } from './dto/send-email.dto';

@ApiTags('mail')
@Controller('mail')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MailController {
  constructor(private mailService: MailService) {}

  @Post('send')
  @ApiOperation({ summary: 'Send an email' })
  @ApiResponse({ status: 200, description: 'Email sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid email data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async sendEmail(@Body() sendEmailDto: SendEmailDto) {
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
    };
  }

  @Post('welcome')
  @ApiOperation({ summary: 'Send welcome email' })
  @ApiResponse({ status: 200, description: 'Welcome email sent successfully' })
  async sendWelcomeEmail(@Body() body: { to: string; name: string }) {
    const result = await this.mailService.sendWelcomeEmail(body.to, body.name);
    return {
      success: true,
      messageId: result.data?.id,
      message: 'Welcome email sent successfully',
    };
  }

  @Post('password-reset')
  @ApiOperation({ summary: 'Send password reset email' })
  @ApiResponse({ status: 200, description: 'Password reset email sent successfully' })
  async sendPasswordResetEmail(@Body() body: { to: string; resetToken: string }) {
    const result = await this.mailService.sendPasswordResetEmail(body.to, body.resetToken);
    return {
      success: true,
      messageId: result.data?.id,
      message: 'Password reset email sent successfully',
    };
  }

  @Post('verification')
  @ApiOperation({ summary: 'Send email verification' })
  @ApiResponse({ status: 200, description: 'Verification email sent successfully' })
  async sendVerificationEmail(@Body() body: { to: string; verificationToken: string }) {
    const result = await this.mailService.sendVerificationEmail(body.to, body.verificationToken);
    return {
      success: true,
      messageId: result.data?.id,
      message: 'Verification email sent successfully',
    };
  }
}