import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { TemplateService } from './services/template.service';
import { TemplateRepository } from '@db/repositories/template.repository';

@Module({
  imports: [ConfigModule],
  controllers: [MailController],
  providers: [MailService, TemplateService, TemplateRepository],
  exports: [MailService],
})
export class MailModule implements OnModuleInit {
  constructor(private mailService: MailService) {}

  async onModuleInit() {
    // Initialize default templates when module starts
    await this.mailService.initializeTemplates();
  }
}