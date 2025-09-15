import { Repository, DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Template, TemplateType, TemplateCategory } from '../entities/template.entity';

@Injectable()
export class TemplateRepository extends Repository<Template> {
  constructor(private readonly dataSource: DataSource) {
    super(Template, dataSource.createEntityManager());
  }

  async findAll(): Promise<Template[]> {
    return this.find();
  }

  async findById(id: string): Promise<Template | null> {
    return this.findOne({ where: { id } });
  }

  async findByName(name: string): Promise<Template | null> {
    return this.findOne({ where: { name, isActive: true } });
  }

  async findByCategory(category: TemplateCategory, type: TemplateType = TemplateType.EMAIL): Promise<Template | null> {
    return this.findOne({ where: { category, type, isActive: true } });
  }

  async findByType(type: TemplateType): Promise<Template[]> {
    return this.find({ where: { type, isActive: true } });
  }

  async createTemplate(templateData: Partial<Template>): Promise<Template> {
    const template = this.create(templateData);
    return this.save(template);
  }

  async updateTemplate(id: string, updateData: Partial<Template>): Promise<Template | null> {
    await this.update(id, updateData);
    return this.findById(id);
  }

  async deleteTemplate(id: string): Promise<boolean> {
    const result = await this.update(id, { isActive: false });
    return result.affected > 0;
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.count({ where: { id } });
    return count > 0;
  }

  async existsByName(name: string): Promise<boolean> {
    const count = await this.count({ where: { name } });
    return count > 0;
  }

  async findActiveTemplates(): Promise<Template[]> {
    return this.find({ where: { isActive: true } });
  }

  async findTemplatesByFilters(type?: TemplateType, category?: TemplateCategory, isActive?: boolean): Promise<Template[]> {
    const queryBuilder = this.createQueryBuilder('template');

    if (type) {
      queryBuilder.andWhere('template.type = :type', { type });
    }

    if (category) {
      queryBuilder.andWhere('template.category = :category', { category });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('template.isActive = :isActive', { isActive });
    }

    return queryBuilder.getMany();
  }
}