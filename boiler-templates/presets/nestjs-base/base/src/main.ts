import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { LoggingService } from './common/logging/logging.service';
import { setupSwagger } from '@config/swagger.config';
import { ResponseTransformInterceptor } from '@interceptors/response-transform.interceptor';
import { AllExceptionsFilter } from '@common/exceptions/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Custom logger
  const loggingService = app.get(LoggingService);
  app.useLogger(loggingService);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global interceptors
  app.useGlobalInterceptors(new ResponseTransformInterceptor());

  // Global exception filters
  app.useGlobalFilters(new AllExceptionsFilter());

  // Enable CORS
  app.enableCors();

  // Global prefix
  app.setGlobalPrefix('api');

  const configService = app.get(ConfigService);

  // Setup Swagger documentation
  if (configService.get<string>('NODE_ENV') !== 'production') {
    setupSwagger(app);
  }
  const port = configService.get<number>('PORT', 3000);

  await app.listen(port);
  loggingService.log(`🚀 {{projectName}} running on port ${port}`);
}

bootstrap();