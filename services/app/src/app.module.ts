import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ThrottlerModule } from '@nestjs/throttler';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MulterModule } from '@nestjs/platform-express';
import { join } from 'path';

import { configValidationSchema } from './config/validation';
import { DatabaseConfig } from './config/database.config';
import { RedisConfig } from './config/redis.config';

// Modules
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { UsersModule } from './modules/users/users.module';
import { FirmsModule } from './modules/firms/firms.module';
import { ClientsModule } from './modules/clients/clients.module';
import { MattersModule } from './modules/matters/matters.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { RetentionModule } from './modules/retention/retention.module';
import { ClientPortalModule } from './modules/client-portal/client-portal.module';
import { AdminModule } from './modules/admin/admin.module';
import { SearchModule } from './modules/search/search.module';
import { AuditModule } from './modules/audit/audit.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { SharesModule } from './modules/shares';

// Common
import { LoggerModule } from './common/logger/logger.module';
import { MetricsModule } from './common/metrics/metrics.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validationSchema: configValidationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),

    // Database
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfig,
    }),

    // Queue system
    BullModule.forRootAsync({
      useClass: RedisConfig,
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // Static files (for development file serving)
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/static',
      exclude: ['/api/*'],
    }),

    // Multer configuration for file uploads
    MulterModule.register({
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB
      },
    }),

    // Core modules
    LoggerModule,
    MetricsModule,
    AuthModule,
    HealthModule,

    // Business modules
    UsersModule,
    FirmsModule,
    ClientsModule,
    MattersModule,
    DocumentsModule,
    RetentionModule,
    ClientPortalModule,
    AdminModule,
    SearchModule,
    AuditModule,
    DashboardModule,
    SharesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
