import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum TemplateType {
  EMAIL = 'email',
  SMS = 'sms',
  WHATSAPP = 'whatsapp',
  PUSH_NOTIFICATION = 'push_notification',
}

export enum TemplateCategory {
  WELCOME = 'welcome',
  PASSWORD_RESET = 'password_reset',
  EMAIL_VERIFICATION = 'email_verification',
  ORDER_CONFIRMATION = 'order_confirmation',
  NOTIFICATION = 'notification',
  MARKETING = 'marketing',
  SYSTEM = 'system',
}

@Entity('communication_templates')
export class Template {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column()
  subject: string;

  @Column('text')
  htmlContent: string;

  @Column('text', { nullable: true })
  textContent?: string;

  @Column({
    type: 'enum',
    enum: TemplateType,
    default: TemplateType.EMAIL,
  })
  type: TemplateType;

  @Column({
    type: 'enum',
    enum: TemplateCategory,
    default: TemplateCategory.NOTIFICATION,
  })
  category: TemplateCategory;

  @Column('json', { nullable: true })
  variables: string[]; // Array of variable names used in template

  @Column('json', { nullable: true })
  metadata: Record<string, any>; // Additional metadata for template

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  description?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}