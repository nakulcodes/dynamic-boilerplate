import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@elastic/elasticsearch';

@Injectable()
export class ElasticsearchService implements OnModuleInit {
  private readonly logger = new Logger(ElasticsearchService.name);
  private client: Client;
  private enabled = false;

  constructor(private configService: ConfigService) {
    const elasticsearchUrl = this.configService.get<string>('ELASTICSEARCH_URL');

    if (elasticsearchUrl) {
      this.client = new Client({
        node: elasticsearchUrl,
      });
      this.enabled = true;
    } else {
      this.logger.warn('Elasticsearch URL not configured, logging to Elasticsearch disabled');
    }
  }

  async onModuleInit() {
    if (this.enabled) {
      try {
        await this.client.ping();
        this.logger.log('Connected to Elasticsearch');
      } catch (error) {
        this.logger.error('Failed to connect to Elasticsearch:', error);
        this.enabled = false;
      }
    }
  }

  async indexLog(index: string, document: any): Promise<void> {
    if (!this.enabled) return;

    try {
      await this.client.index({
        index: `{{projectName}}-${index}-${new Date().toISOString().split('T')[0]}`,
        document: {
          ...document,
          '@timestamp': new Date().toISOString(),
          service: '{{projectName}}',
        },
      });
    } catch (error) {
      this.logger.error('Failed to index log to Elasticsearch:', error);
    }
  }

  async searchLogs(index: string, query: any): Promise<any> {
    if (!this.enabled) {
      return { hits: { hits: [] } };
    }

    try {
      return await this.client.search({
        index: `{{projectName}}-${index}-*`,
        body: query,
      });
    } catch (error) {
      this.logger.error('Failed to search logs in Elasticsearch:', error);
      return { hits: { hits: [] } };
    }
  }
}