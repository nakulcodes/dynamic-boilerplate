import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Template, TemplateType, TemplateCategory } from '../entities/template.entity';

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
    @InjectRepository(Template)
    private templateRepository: Repository<Template>,
  ) {}

  /**
   * Get template by ID and populate variables
   */
  async getTemplateById(templateId: string, variables: TemplateVariables = {}): Promise<ProcessedTemplate> {
    const template = await this.templateRepository.findOne({
      where: { id: templateId, isActive: true },
    });

    if (!template) {
      throw new NotFoundException(`Template with ID ${templateId} not found`);
    }

    return this.processTemplate(template, variables);
  }

  /**
   * Get template by name and populate variables
   */
  async getTemplateByName(name: string, variables: TemplateVariables = {}): Promise<ProcessedTemplate> {
    const template = await this.templateRepository.findOne({
      where: { name, isActive: true },
    });

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
    const template = await this.templateRepository.findOne({
      where: { category, type, isActive: true },
    });

    if (!template) {
      throw new NotFoundException(`Template for category ${category} and type ${type} not found`);
    }

    return this.processTemplate(template, variables);
  }

  /**
   * Create a new template
   */
  async createTemplate(templateData: Partial<Template>): Promise<Template> {
    const template = this.templateRepository.create(templateData);
    return await this.templateRepository.save(template);
  }

  /**
   * Update existing template
   */
  async updateTemplate(templateId: string, updateData: Partial<Template>): Promise<Template> {
    const template = await this.templateRepository.findOne({ where: { id: templateId } });

    if (!template) {
      throw new NotFoundException(`Template with ID ${templateId} not found`);
    }

    Object.assign(template, updateData);
    return await this.templateRepository.save(template);
  }

  /**
   * Get all templates with filtering
   */
  async getTemplates(
    type?: TemplateType,
    category?: TemplateCategory,
    isActive?: boolean
  ): Promise<Template[]> {
    const queryBuilder = this.templateRepository.createQueryBuilder('template');

    if (type) {
      queryBuilder.andWhere('template.type = :type', { type });
    }

    if (category) {
      queryBuilder.andWhere('template.category = :category', { category });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('template.isActive = :isActive', { isActive });
    }

    return await queryBuilder.getMany();
  }

  /**
   * Delete template (soft delete by setting isActive to false)
   */
  async deleteTemplate(templateId: string): Promise<void> {
    const result = await this.templateRepository.update(
      { id: templateId },
      { isActive: false }
    );

    if (result.affected === 0) {
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
   * Replace variables in string using  syntax
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
        subject: 'Welcome to testing-boilerplate, !',
        htmlContent: `
          <h1>Welcome, !</h1>
          <p>Thank you for signing up for testing-boilerplate. We're excited to have you on board!</p>
          <p>Your account email: </p>
          <p>Best regards,<br>The testing-boilerplate Team</p>
        `,
        textContent: 'Welcome, ! Thank you for signing up for testing-boilerplate. We\'re excited to have you on board! Your account email: . Best regards, The testing-boilerplate Team',
        type: TemplateType.EMAIL,
        category: TemplateCategory.WELCOME,
        variables: ['name', 'email', 'projectName'],
        description: 'Welcome email template for new users',
      },
      {
        name: 'password-reset-email',
        subject: 'Reset Your Password - testing-boilerplate',
        htmlContent: `
          <h1>Reset Your Password</h1>
          <p>You requested a password reset for your testing-boilerplate account.</p>
          <p>Click the link below to reset your password:</p>
          <a href="" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p>If you didn't request this, please ignore this email.</p>
          <p>This link will expire in  minutes.</p>
        `,
        textContent: 'Reset Your Password - You requested a password reset. Visit:  (expires in  minutes)',
        type: TemplateType.EMAIL,
        category: TemplateCategory.PASSWORD_RESET,
        variables: ['projectName', 'resetUrl', 'expirationTime'],
        description: 'Password reset email template',
      },
      {
        name: 'email-verification',
        subject: 'Verify Your Email - testing-boilerplate',
        htmlContent: `
          <h1>Verify Your Email</h1>
          <p>Hello ,</p>
          <p>Please verify your email address by clicking the link below:</p>
          <a href="" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
          <p>If you didn't create an account, please ignore this email.</p>
        `,
        textContent: 'Verify Your Email - Please verify your email: ',
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