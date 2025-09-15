import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { TemplateService } from './services/template.service';
import { Template } from './entities/template.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Template]),
  ],
  controllers: [MailController],
  providers: [MailService, TemplateService],
  exports: [MailService, TemplateService],
})
export class MailModule implements OnModuleInit {
  constructor(private mailService: MailService) {}

  async onModuleInit() {
    // Initialize default templates when module starts
    await this.mailService.initializeTemplates();
  }
}