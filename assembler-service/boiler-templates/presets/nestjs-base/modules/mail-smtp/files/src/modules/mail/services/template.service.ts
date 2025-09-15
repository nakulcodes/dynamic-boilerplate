import { Injectable, NotFoundException } from '@nestjs/common';
import { Template, TemplateType, TemplateCategory } from '@db/entities/template.entity';
import { TemplateRepository } from '@db/repositories/template.repository';

export interface TemplateVariables {
  [key: string]: any;
}

export interface ProcessedTemplate {
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables: string[];
  metadata?: Record<string, any>;
}

@Injectable()
export class TemplateService {
  constructor(
    private readonly templateRepository: TemplateRepository,
  ) {}

  /**
   * Get template by ID and populate variables
   */
  async getTemplateById(templateId: string, variables: TemplateVariables = {}): Promise<ProcessedTemplate> {
    const template = await this.templateRepository.findById(templateId);

    if (!template) {
      throw new NotFoundException(`Template with ID ${templateId} not found`);
    }

    return this.processTemplate(template, variables);
  }

  /**
   * Get template by name and populate variables
   */
  async getTemplateByName(name: string, variables: TemplateVariables = {}): Promise<ProcessedTemplate> {
    const template = await this.templateRepository.findByName(name);

    if (!template) {
      throw new NotFoundException(`Template with name ${name} not found`);
    }

    return this.processTemplate(template, variables);
  }

  /**
   * Get template by category and type
   */
  async getTemplateByCategory(
    category: TemplateCategory,
    type: TemplateType = TemplateType.EMAIL,
    variables: TemplateVariables = {}
  ): Promise<ProcessedTemplate> {
    const template = await this.templateRepository.findByCategory(category, type);

    if (!template) {
      throw new NotFoundException(`Template for category ${category} and type ${type} not found`);
    }

    return this.processTemplate(template, variables);
  }

  /**
   * Create a new template
   */
  async createTemplate(templateData: Partial<Template>): Promise<Template> {
    return await this.templateRepository.createTemplate(templateData);
  }

  /**
   * Update existing template
   */
  async updateTemplate(templateId: string, updateData: Partial<Template>): Promise<Template> {
    const template = await this.templateRepository.updateTemplate(templateId, updateData);

    if (!template) {
      throw new NotFoundException(`Template with ID ${templateId} not found`);
    }

    return template;
  }

  /**
   * Get all templates with filtering
   */
  async getTemplates(
    type?: TemplateType,
    category?: TemplateCategory,
    isActive?: boolean
  ): Promise<Template[]> {
    return await this.templateRepository.findTemplatesByFilters(type, category, isActive);
  }

  /**
   * Delete template (soft delete by setting isActive to false)
   */
  async deleteTemplate(templateId: string): Promise<void> {
    const result = await this.templateRepository.deleteTemplate(templateId);

    if (!result) {
      throw new NotFoundException(`Template with ID ${templateId} not found`);
    }
  }

  /**
   * Process template by replacing variables
   */
  private processTemplate(template: Template, variables: TemplateVariables): ProcessedTemplate {
    const subject = this.replaceVariables(template.subject, variables);
    const htmlContent = this.replaceVariables(template.htmlContent, variables);
    const textContent = template.textContent ? this.replaceVariables(template.textContent, variables) : undefined;

    return {
      subject,
      htmlContent,
      textContent,
      variables: template.variables || [],
      metadata: template.metadata || {},
    };
  }

  /**
   * Replace variables in string using {{variableName}} syntax
   */
  private replaceVariables(content: string, variables: TemplateVariables): string {
    return content.replace(/\{\{(\w+)\}\}/g, (match, variableName) => {
      return variables[variableName] !== undefined ? String(variables[variableName]) : match;
    });
  }

  /**
   * Extract variable names from template content
   */
  private extractVariables(content: string): string[] {
    const matches = content.match(/\{\{(\w+)\}\}/g);
    if (!matches) return [];

    return [...new Set(matches.map(match => match.replace(/[\{\}]/g, '')))];
  }

  /**
   * Seed default templates (useful for initial setup)
   */
  async seedDefaultTemplates(): Promise<void> {
    const defaultTemplates = [
      {
        name: 'welcome-email',
        subject: 'Welcome to {{projectName}}, {{name}}!',
        htmlContent: `
          <h1>Welcome, {{name}}!</h1>
          <p>Thank you for signing up for {{projectName}}. We're excited to have you on board!</p>
          <p>Your account email: {{email}}</p>
          <p>Best regards,<br>The {{projectName}} Team</p>
        `,
        textContent: 'Welcome, {{name}}! Thank you for signing up for {{projectName}}. We\'re excited to have you on board! Your account email: {{email}}. Best regards, The {{projectName}} Team',
        type: TemplateType.EMAIL,
        category: TemplateCategory.WELCOME,
        variables: ['name', 'email', 'projectName'],
        description: 'Welcome email template for new users',
      },
      {
        name: 'password-reset-email',
        subject: 'Reset Your Password - {{projectName}}',
        htmlContent: `
          <h1>Reset Your Password</h1>
          <p>You requested a password reset for your {{projectName}} account.</p>
          <p>Click the link below to reset your password:</p>
          <a href="{{resetUrl}}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p>If you didn't request this, please ignore this email.</p>
          <p>This link will expire in {{expirationTime}} minutes.</p>
        `,
        textContent: 'Reset Your Password - You requested a password reset. Visit: {{resetUrl}} (expires in {{expirationTime}} minutes)',
        type: TemplateType.EMAIL,
        category: TemplateCategory.PASSWORD_RESET,
        variables: ['projectName', 'resetUrl', 'expirationTime'],
        description: 'Password reset email template',
      },
      {
        name: 'email-verification',
        subject: 'Verify Your Email - {{projectName}}',
        htmlContent: `
          <h1>Verify Your Email</h1>
          <p>Hello {{name}},</p>
          <p>Please verify your email address by clicking the link below:</p>
          <a href="{{verificationUrl}}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
          <p>If you didn't create an account, please ignore this email.</p>
        `,
        textContent: 'Verify Your Email - Please verify your email: {{verificationUrl}}',
        type: TemplateType.EMAIL,
        category: TemplateCategory.EMAIL_VERIFICATION,
        variables: ['name', 'projectName', 'verificationUrl'],
        description: 'Email verification template',
      },
    ];

    for (const templateData of defaultTemplates) {
      const existingTemplate = await this.templateRepository.findOne({
        where: { name: templateData.name },
      });

      if (!existingTemplate) {
        await this.createTemplate(templateData);
      }
    }
  }
}