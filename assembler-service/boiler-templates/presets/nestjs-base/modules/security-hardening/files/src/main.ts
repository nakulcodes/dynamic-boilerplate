import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as mongoSanitize from 'express-mongo-sanitize';
import * as hpp from 'hpp';
import { AppModule } from './app.module';
import { SecurityService } from './modules/security/security.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get security service for configuration
  const securityService = app.get(SecurityService);
  const securityConfig = securityService.getSecurityConfig();

  // Security middleware setup
  app.use(helmet(securityConfig.helmet));

  // Sanitize data to prevent NoSQL injection attacks
  app.use(mongoSanitize());

  // Prevent HTTP Parameter Pollution attacks
  app.use(hpp());

  // CORS configuration
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (securityService.validateOrigin(origin)) {
        return callback(null, true);
      }

      securityService.logSecurityEvent('CORS_VIOLATION', { origin });
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Global validation pipe with security options
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are found
      transform: true, // Automatically transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: false, // Disable implicit type conversion for security
      },
      disableErrorMessages: process.env.NODE_ENV === 'production', // Hide detailed error messages in production
    }),
  );

  // API prefix
  app.setGlobalPrefix('api');

  // Swagger documentation
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('{{projectName}} API')
      .setDescription('Secure API documentation for {{projectName}}')
      .setVersion('1.0')
      .addBearerAuth()
      .addServer('/', 'Development server')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  console.log(`🔒 Security features enabled: Helmet, CORS, Rate Limiting, Input Sanitization`);
}

bootstrap();