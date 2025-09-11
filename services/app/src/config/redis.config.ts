import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BullRootModuleOptions, SharedBullConfigurationFactory } from '@nestjs/bull';

@Injectable()
export class RedisConfig implements SharedBullConfigurationFactory {
  constructor(private configService: ConfigService) {}

  createSharedConfiguration(): BullRootModuleOptions {
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