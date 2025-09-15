import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { TemplateService, TemplateVariables } from './services/template.service';
import { TemplateCategory, TemplateType } from './entities/template.entity';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface SendTemplateEmailOptions {
  to: string | string[];
  templateId?: string;
  templateName?: string;
  variables?: TemplateVariables;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

@Injectable()
export class MailService {
  private resend: Resend;
  private defaultFrom: string;

  constructor(
    private configService: ConfigService,
    private templateService: TemplateService,
  ) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is required for Resend mail service');
    }

    this.resend = new Resend(apiKey);
    this.defaultFrom = this.configService.get<string>('MAIL_FROM') || 'noreply@example.com';
  }

  async sendEmail(options: SendEmailOptions): Promise<any> {
    try {
      const result = await this.resend.emails.send({
        from: options.from || this.defaultFrom,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
        cc: options.cc ? (Array.isArray(options.cc) ? options.cc : [options.cc]) : undefined,
        bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc : [options.bcc]) : undefined,
        attachments: options.attachments?.map(att => ({
          filename: att.filename,
          content: att.content,
          type: att.contentType,
        })),
      });

      return result;
    } catch (error) {
      console.error('Failed to send email with Resend:', error);
      throw new Error('Failed to send email');
    }
  }

  /**
   * Send email using database template by ID
   */
  async sendTemplateEmail(options: SendTemplateEmailOptions): Promise<any> {
    let template;

    if (options.templateId) {
      template = await this.templateService.getTemplateById(options.templateId, options.variables || {});
    } else if (options.templateName) {
      template = await this.templateService.getTemplateByName(options.templateName, options.variables || {});
    } else {
      throw new Error('Either templateId or templateName must be provided');
    }

    return this.sendEmail({
      to: options.to,
      subject: template.subject,
      html: template.htmlContent,
      text: template.textContent,
      from: options.from,
      cc: options.cc,
      bcc: options.bcc,
      attachments: options.attachments,
    });
  }

  /**
   * Send email using template by category
   */
  async sendTemplateEmailByCategory(
    to: string | string[],
    category: TemplateCategory,
    variables: TemplateVariables,
    options?: {
      from?: string;
      cc?: string | string[];
      bcc?: string | string[];
      attachments?: Array<{
        filename: string;
        content: Buffer | string;
        contentType?: string;
      }>;
    }
  ): Promise<any> {
    const template = await this.templateService.getTemplateByCategory(
      category,
      TemplateType.EMAIL,
      variables
    );

    return this.sendEmail({
      to,
      subject: template.subject,
      html: template.htmlContent,
      text: template.textContent,
      from: options?.from,
      cc: options?.cc,
      bcc: options?.bcc,
      attachments: options?.attachments,
    });
  }

  /**
   * Send welcome email using template
   */
  async sendWelcomeEmail(to: string, name: string, email: string): Promise<any> {
    return this.sendTemplateEmailByCategory(
      to,
      TemplateCategory.WELCOME,
      {
        name,
        email,
        projectName: this.configService.get<string>('PROJECT_NAME') || 'Our Platform',
      }
    );
  }

  /**
   * Send password reset email using template
   */
  async sendPasswordResetEmail(to: string, resetToken: string): Promise<any> {
    const resetUrl = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${resetToken}`;

    return this.sendTemplateEmailByCategory(
      to,
      TemplateCategory.PASSWORD_RESET,
      {
        projectName: this.configService.get<string>('PROJECT_NAME') || 'Our Platform',
        resetUrl,
        expirationTime: '60',
      }
    );
  }

  /**
   * Send email verification using template
   */
  async sendVerificationEmail(to: string, verificationToken: string, name?: string): Promise<any> {
    const verificationUrl = `${this.configService.get<string>('FRONTEND_URL')}/verify-email?token=${verificationToken}`;

    return this.sendTemplateEmailByCategory(
      to,
      TemplateCategory.EMAIL_VERIFICATION,
      {
        name: name || 'User',
        projectName: this.configService.get<string>('PROJECT_NAME') || 'Our Platform',
        verificationUrl,
      }
    );
  }

  /**
   * Initialize default templates (call this during module initialization)
   */
  async initializeTemplates(): Promise<void> {
    await this.templateService.seedDefaultTemplates();
  }
}