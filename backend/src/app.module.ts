import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_GUARD } from '@nestjs/core';
import * as Joi from 'joi';

// Feature modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CoursesModule } from './modules/courses/courses.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { GradesModule } from './modules/grades/grades.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { MessagesModule } from './modules/messages/messages.module';
import { FilesModule } from './modules/files/files.module';
import { RolesModule } from './modules/roles/roles.module';
import { HealthModule } from './modules/health/health.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
      validationSchema: Joi.object({
        // App
        APP_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
        APP_PORT: Joi.number().default(4000),
        APP_CORS_ORIGINS: Joi.string().default('http://localhost:3000'),

        // Database
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().default(5432),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_DATABASE: Joi.string().required(),
        DB_SSL: Joi.boolean().default(false),
        DB_LOGGING: Joi.boolean().default(false),
        DB_POOL_MAX: Joi.number().default(50),
        DB_POOL_MIN: Joi.number().default(5),

        // JWT
        JWT_SECRET: Joi.string().required().min(32),
        JWT_REFRESH_SECRET: Joi.string().required().min(32),
        JWT_EXPIRATION: Joi.string().default('15m'),
        JWT_REFRESH_EXPIRATION: Joi.string().default('7d'),

        // Redis (optional)
        REDIS_HOST: Joi.string().optional(),
        REDIS_PORT: Joi.number().default(6379),
        REDIS_PASSWORD: Joi.string().optional().allow(''),
        REDIS_DB: Joi.number().default(0),
        REDIS_TTL: Joi.number().default(3600),

        // Bull
        BULL_REDIS_HOST: Joi.string().default('localhost'),
        BULL_REDIS_PORT: Joi.number().default(6379),

        // Throttle
        THROTTLE_TTL: Joi.number().default(60),
        THROTTLE_LIMIT: Joi.number().default(100),
        THROTTLE_SHORT_LIMIT: Joi.number().default(20),

        // File uploads
        UPLOAD_MAX_SIZE: Joi.number().default(10485760),
        UPLOAD_DEST: Joi.string().default('./uploads'),
      }),
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),

    // PostgreSQL Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USERNAME', 'moodlenext'),
        password: config.get<string>('DB_PASSWORD', 'moodlenext_secret_2024'),
        database: config.get<string>('DB_DATABASE', 'moodlenext'),
        autoLoadEntities: true,
        synchronize: config.get<string>('APP_ENV') === 'development',
        logging: config.get<boolean>('DB_LOGGING', false),
        ssl: config.get<boolean>('DB_SSL', false)
          ? { rejectUnauthorized: false }
          : false,
        // Connection pooling for high traffic
        extra: {
          max: config.get<number>('DB_POOL_MAX', 50),
          min: config.get<number>('DB_POOL_MIN', 5),
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000,
          // Prepared statement cache for repeated queries
          statement_timeout: 60000, // 60s query timeout
          idle_in_transaction_session_timeout: 30000,
        },
      }),
    }),

    // Rate Limiting – multiple windows for burst + sustained protection
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            // Short burst protection: max requests per 10 seconds
            name: 'short',
            ttl: 10 * 1000,
            limit: config.get<number>('THROTTLE_SHORT_LIMIT', 20),
          },
          {
            // Sustained load protection: max requests per minute
            name: 'medium',
            ttl: config.get<number>('THROTTLE_TTL', 60) * 1000,
            limit: config.get<number>('THROTTLE_LIMIT', 100),
          },
        ],
      }),
    }),

    // Cache with Redis
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ttl: config.get<number>('REDIS_TTL', 3600) * 1000,
        max: 1000,
        // If Redis is configured, use it; otherwise in-memory
        ...(config.get<string>('REDIS_HOST')
          ? {
              store: 'redis',
              host: config.get<string>('REDIS_HOST'),
              port: config.get<number>('REDIS_PORT', 6379),
              password: config.get<string>('REDIS_PASSWORD', ''),
              db: config.get<number>('REDIS_DB', 0),
            }
          : {}),
      }),
    }),

    // Bull Queue for background jobs
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get<string>('BULL_REDIS_HOST', 'localhost'),
          port: config.get<number>('BULL_REDIS_PORT', 6379),
        },
      }),
    }),

    // Scheduled tasks (cron)
    ScheduleModule.forRoot(),

    // Feature Modules
    AuthModule,
    UsersModule,
    CoursesModule,
    CategoriesModule,
    EnrollmentsModule,
    ActivitiesModule,
    GradesModule,
    CalendarModule,
    MessagesModule,
    FilesModule,
    RolesModule,
    HealthModule,
    NotificationsModule,
    DashboardModule,
  ],
  providers: [
    // Global throttle guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
