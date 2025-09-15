import 'tsconfig-paths/register';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { setupSwagger } from '@config/swagger.config';
import { ResponseTransformInterceptor } from '@interceptors/response-transform.interceptor';
import { AllExceptionsFilter } from '@common/exceptions/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  const configService = app.get(ConfigService);

  // Enable CORS
  app.enableCors({
    origin: configService.get<string>('NODE_ENV') === 'production'
      ? configService.get<string>('FRONTEND_URL')
      : true,
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Setup Swagger documentation
  if (configService.get<string>('NODE_ENV') !== 'production') {
    setupSwagger(app);
  }
  const port = configService.get<number>('PORT', 3000);

  await app.listen(port);
  console.log(`🚀 Assembler Service running on port ${port}`);
}

bootstrap();