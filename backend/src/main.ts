import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe, VersioningType, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import fastifyCompress from '@fastify/compress';
import fastifyHelmet from '@fastify/helmet';
import fastifyCookie from '@fastify/cookie';
import fastifyMultipart from '@fastify/multipart';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';
import { StructuredLogger } from './common/logger/structured.logger';

async function bootstrap() {
  const structuredLogger = new StructuredLogger();

  // Create NestJS app with Fastify adapter for high performance
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: false,
      trustProxy: true,
      maxParamLength: 500,
    }),
    {
      bufferLogs: true,
      logger: structuredLogger,
    },
  );

  const logger = new Logger('Bootstrap');

  const configService = app.get(ConfigService);
  const port = configService.get<number>('APP_PORT', 4000);
  const appName = configService.get<string>('APP_NAME', 'MoodleNext');
  const corsOrigins = configService.get<string>('APP_CORS_ORIGINS', 'http://localhost:3000');
  const isProduction = configService.get<string>('APP_ENV') === 'production';

  // Global prefix
  app.setGlobalPrefix('api');

  // API Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // CORS – restrict origins in production
  app.enableCors({
    origin: corsOrigins.split(',').map((o) => o.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge: 86400, // Preflight cache 24h
  });

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Fastify plugins
  await app.register(fastifyCompress, { encodings: ['gzip', 'deflate', 'br'] });
  await app.register(fastifyHelmet, {
    contentSecurityPolicy: isProduction
      ? {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'blob:'],
            fontSrc: ["'self'", 'data:'],
            connectSrc: ["'self'", 'ws:', 'wss:'],
          },
        }
      : false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    hsts: isProduction ? { maxAge: 31536000, includeSubDomains: true } : false,
  });
  await app.register(fastifyCookie);
  await app.register(fastifyMultipart, {
    limits: {
      fileSize: configService.get<number>('UPLOAD_MAX_SIZE', 52428800),
      files: 5, // Max 5 files per request
      fieldSize: 1048576, // 1MB max field size
    },
  });

  // Swagger API Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle(`${appName} API`)
    .setDescription('MoodleNext LMS RESTful API - Learning Management System')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'access-token',
    )
    .addTag('Auth', 'Authentication & Authorization')
    .addTag('Users', 'User Management')
    .addTag('Courses', 'Course Management')
    .addTag('Categories', 'Course Categories')
    .addTag('Enrollments', 'Course Enrollments')
    .addTag('Activities', 'Course Activities & Modules')
    .addTag('Grades', 'Grading System')
    .addTag('Calendar', 'Calendar Events')
    .addTag('Messages', 'Messaging System')
    .addTag('Files', 'File Management')
    .addTag('Health', 'Health Checks')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  // Only expose Swagger in non-production environments
  if (!isProduction) {
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'none',
      },
    });
  }

  // Graceful shutdown
  app.enableShutdownHooks();

  // Global interceptors & filters
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(
    new TimeoutInterceptor(30000), // 30s timeout for all requests
    new TransformInterceptor(),
  );

  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 ${appName} API running on http://localhost:${port}`);
  logger.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
  logger.log(`🏥 Health check: http://localhost:${port}/api/v1/health`);
}

bootstrap();
