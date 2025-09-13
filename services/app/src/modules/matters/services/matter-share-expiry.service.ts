// TEMPORARILY DISABLED - Dependencies not available
/*
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MatterShareService } from './matter-share.service';

@Injectable()
export class MatterShareExpiryService {
  private readonly logger = new Logger(MatterShareExpiryService.name);

  constructor(private readonly matterShareService: MatterShareService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleExpiredShares(): Promise<void> {
    try {
      this.logger.log('Starting expired matter shares cleanup...');
      
      const expiredCount = await this.matterShareService.expireOldShares();
      
      if (expiredCount > 0) {
        this.logger.log(`Expired ${expiredCount} matter shares`);
      } else {
        this.logger.debug('No expired matter shares found');
      }
    } catch (error) {
      this.logger.error('Failed to process expired matter shares', error);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM) 
  async generateExpiryWarnings(): Promise<void> {
    try {
      this.logger.log('Checking for shares expiring soon...');
      
      // This could be extended to send notifications for shares expiring in X days
      // For now, we just log the check
      this.logger.debug('Expiry warning check completed');
    } catch (error) {
      this.logger.error('Failed to generate expiry warnings', error);
    }
  }
}
*/