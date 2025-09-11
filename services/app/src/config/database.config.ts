import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      url: this.configService.get('DATABASE_URL'),
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
      synchronize: false, // Always use migrations in production
      logging: this.configService.get('NODE_ENV') === 'development',
      migrationsRun: false, // Run migrations manually
      ssl: this.configService.get('NODE_ENV') === 'production' ? {
        rejectUnauthorized: false,
      } : false,
      extra: {
        // Connection pool settings
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      },
    };
  }
}