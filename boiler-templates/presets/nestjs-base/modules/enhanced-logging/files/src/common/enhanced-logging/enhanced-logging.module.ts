import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ElasticsearchService } from './elasticsearch.service';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';

@Module({
  imports: [ConfigModule],
  controllers: [MetricsController],
  providers: [ElasticsearchService, MetricsService],
  exports: [ElasticsearchService, MetricsService],
})
export class EnhancedLoggingModule {}