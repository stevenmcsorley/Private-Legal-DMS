import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BullRootModuleOptions, BullOptionsFactory } from '@nestjs/bull';

@Injectable()
export class RedisConfig implements BullOptionsFactory {
  constructor(private configService: ConfigService) {}

  createBullOptions(): BullRootModuleOptions {
    const redisUrl = this.configService.get('REDIS_URL');
    
    return {
      redis: redisUrl,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 50,
        removeOnFail: 20,
      },
    };
  }
}