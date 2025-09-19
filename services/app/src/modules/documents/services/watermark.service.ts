import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import { SystemSettings } from '../../../common/entities/system-settings.entity';

export interface WatermarkOptions {
  firmName: string;
  shareId: string;
  recipientFirm: string;
  confidentialityLevel: 'confidential' | 'privileged' | 'work_product';
  timestamp: Date;
}

@Injectable()
export class WatermarkService {
  private readonly logger = new Logger(WatermarkService.name);

  constructor(
    @InjectRepository(SystemSettings)
    private readonly systemSettingsRepository: Repository<SystemSettings>,
  ) {}

  private async getWatermarkConfig() {
    const watermarkSetting = await this.systemSettingsRepository.findOne({
      where: { key: 'watermark_config' },
    });

    const defaultConfig = {
      enabled: true,
      text: 'CONFIDENTIAL - {firm_name}',
      opacity: 0.3,
    };

    if (!watermarkSetting?.value) {
      return defaultConfig;
    }

    return {
      ...defaultConfig,
      ...watermarkSetting.value,
    };
  }

  async applyWatermark(pdfBuffer: Buffer, options: WatermarkOptions): Promise<Buffer> {
    try {
      // Get watermark configuration from admin settings
      const config = await this.getWatermarkConfig();
      
      if (!config.enabled) {
        this.logger.log('Watermarking is disabled in system settings');
        return pdfBuffer;
      }

      this.logger.log(`Applying watermark for share ${options.shareId} - ${options.firmName} to ${options.recipientFirm}`);
      this.logger.log(`Confidentiality level: ${options.confidentialityLevel}`);
      
      // Watermarking functionality now active with pdf-lib
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      const pages = pdfDoc.getPages();
      
      // Process watermark text template
      const watermarkText = config.text.replace('{firm_name}', options.firmName);
      const watermarkOpacity = Math.min(Math.max(config.opacity, 0.1), 1.0); // Clamp between 0.1 and 1.0
      
      for (const page of pages) {
        const { width, height } = page.getSize();
        
        // Header watermark - firm branding
        const headerText = `${options.firmName} - ${options.confidentialityLevel.toUpperCase()}`;
        page.drawText(headerText, {
          x: 50,
          y: height - 30,
          size: 10,
          font: helveticaBold,
          color: rgb(0.5, 0.5, 0.5),
        });
        
        // Footer watermark - sharing info
        const footerText = `Shared with ${options.recipientFirm} | Share ID: ${options.shareId} | ${options.timestamp.toISOString().split('T')[0]}`;
        page.drawText(footerText, {
          x: 50,
          y: 20,
          size: 8,
          font: helveticaFont,
          color: rgb(0.4, 0.4, 0.4),
        });
        
        // Diagonal custom watermark from admin settings
        page.drawText(watermarkText, {
          x: width / 2 - (watermarkText.length * 12), // Rough centering
          y: height / 2,
          size: 48,
          font: helveticaBold,
          color: rgb(watermarkOpacity, watermarkOpacity, watermarkOpacity),
          rotate: degrees(45)
        });
        
        // Additional confidentiality notice for work product
        if (options.confidentialityLevel === 'work_product') {
          page.drawText('ATTORNEY WORK PRODUCT', {
            x: width / 2 - 150,
            y: height / 2 - 60,
            size: 24,
            font: helveticaBold,
            color: rgb(watermarkOpacity * 0.8, watermarkOpacity * 0.8, watermarkOpacity * 0.8),
            rotate: degrees(45),
          });
        }
      }
      
      const watermarkedPdf = await pdfDoc.save();
      this.logger.log(`Applied watermark to PDF for share ${options.shareId} with custom text: "${watermarkText}"`);
      return Buffer.from(watermarkedPdf);
    } catch (error) {
      this.logger.error(`Failed to apply watermark: ${error.message}`, error.stack);
      return pdfBuffer;
    }
  }

  async shouldApplyWatermark(mimeType: string, isExternalShare: boolean): Promise<boolean> {
    const config = await this.getWatermarkConfig();
    
    if (!config.enabled || !isExternalShare) {
      return false;
    }

    // Currently supported file types for watermarking
    const supportedTypes = [
      'application/pdf',
      // TODO: Add support for other document types:
      // 'application/msword', // .doc
      // 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      // 'image/jpeg',
      // 'image/png',
    ];

    return supportedTypes.includes(mimeType);
  }

  /**
   * Add watermark to various document types
   * Currently supports: PDF
   * Future support planned for: Word docs, images
   */
  async applyWatermarkByType(documentBuffer: Buffer, mimeType: string, options: WatermarkOptions): Promise<Buffer> {
    switch (mimeType) {
      case 'application/pdf':
        return this.applyWatermark(documentBuffer, options);
      
      // TODO: Add support for other document types
      // case 'application/msword':
      // case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      //   return this.applyWordWatermark(documentBuffer, options);
      
      // case 'image/jpeg':
      // case 'image/png':
      //   return this.applyImageWatermark(documentBuffer, options);
      
      default:
        this.logger.warn(`Watermarking not supported for file type: ${mimeType}`);
        return documentBuffer;
    }
  }
}