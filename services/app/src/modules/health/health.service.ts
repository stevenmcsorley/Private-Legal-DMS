import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    private configService: ConfigService,
    @InjectConnection() private connection: Connection,
  ) {}

  async checkHealth() {
    const checks = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: this.configService.get('NODE_ENV'),
      checks: {
        database: await this.checkDatabase(),
        // Add more health checks as services are implemented
      },
    };

    // Determine overall status
    const hasFailures = Object.values(checks.checks).some(
      (check: any) => check.status !== 'ok',
    );

    if (hasFailures) {
      checks.status = 'error';
    }

    return checks;
  }

  async checkReadiness() {
    try {
      const dbCheck = await this.checkDatabase();
      
      return {
        status: dbCheck.status === 'ok' ? 'ready' : 'not_ready',
        timestamp: new Date().toISOString(),
        checks: {
          database: dbCheck,
        },
      };
    } catch (error) {
      this.logger.error('Readiness check failed', error);
      return {
        status: 'not_ready',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  private async checkDatabase() {
    try {
      await this.connection.query('SELECT 1');
      return {
        status: 'ok',
        message: 'Database connection is healthy',
      };
    } catch (error) {
      this.logger.error('Database health check failed', error);
      return {
        status: 'error',
        message: 'Database connection failed',
        error: error.message,
      };
    }
  }
}