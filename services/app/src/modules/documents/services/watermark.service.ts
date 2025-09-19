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
      fontSize: 48,
      position: 'center', // center, top-left, top-right, bottom-left, bottom-right, diagonal
      color: 'gray', // gray, red, blue, black
      rotation: 45, // degrees
    };

    if (!watermarkSetting?.value) {
      return defaultConfig;
    }

    return {
      ...defaultConfig,
      ...watermarkSetting.value,
    };
  }

  private getWatermarkPosition(position: string, pageWidth: number, pageHeight: number, textWidth: number, fontSize: number) {
    const margin = 50;
    
    switch (position) {
      case 'top-left':
        return { x: margin, y: pageHeight - margin - fontSize };
      case 'top-right':
        return { x: pageWidth - margin - textWidth, y: pageHeight - margin - fontSize };
      case 'bottom-left':
        return { x: margin, y: margin };
      case 'bottom-right':
        return { x: pageWidth - margin - textWidth, y: margin };
      case 'center':
        return { x: pageWidth / 2 - textWidth / 2, y: pageHeight / 2 };
      case 'diagonal':
      default:
        return { x: pageWidth / 2 - textWidth / 2, y: pageHeight / 2 };
    }
  }

  private getWatermarkColor(colorName: string) {
    const colors = {
      gray: rgb(0.5, 0.5, 0.5),
      red: rgb(0.8, 0.2, 0.2),
      blue: rgb(0.2, 0.2, 0.8),
      black: rgb(0.2, 0.2, 0.2),
    };
    
    return colors[colorName] || colors.gray;
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
      const fontSize = config.fontSize || 48;
      const watermarkColor = this.getWatermarkColor(config.color || 'gray');
      const rotation = config.rotation || 45;
      
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
        
        // Main watermark with proper positioning
        const textWidth = helveticaBold.widthOfTextAtSize(watermarkText, fontSize);
        const position = this.getWatermarkPosition(config.position || 'diagonal', width, height, textWidth, fontSize);
        
        page.drawText(watermarkText, {
          x: position.x,
          y: position.y,
          size: fontSize,
          font: helveticaBold,
          color: watermarkColor,
          opacity: watermarkOpacity,
          rotate: config.position === 'diagonal' ? degrees(rotation) : degrees(0),
        });
        
        // Additional confidentiality notice for work product
        if (options.confidentialityLevel === 'work_product') {
          const workProductText = 'ATTORNEY WORK PRODUCT';
          const workProductWidth = helveticaBold.widthOfTextAtSize(workProductText, 24);
          page.drawText(workProductText, {
            x: width / 2 - workProductWidth / 2,
            y: position.y - 60,
            size: 24,
            font: helveticaBold,
            color: this.getWatermarkColor(config.color || 'gray'),
            opacity: watermarkOpacity * 0.8,
            rotate: config.position === 'diagonal' ? degrees(rotation) : degrees(0),
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
   * Generate a preview PDF with watermark for testing configuration
   */
  async generatePreviewPDF(watermarkConfig: any): Promise<Buffer> {
    try {
      // Create a simple PDF document for preview
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]); // A4 size
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      const { width, height } = page.getSize();
      
      // Add sample content
      page.drawText('SAMPLE DOCUMENT', {
        x: 50,
        y: height - 100,
        size: 24,
        font: helveticaBold,
        color: rgb(0, 0, 0),
      });
      
      page.drawText('This is a preview of how the watermark will appear on your documents.', {
        x: 50,
        y: height - 150,
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      
      page.drawText('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod', {
        x: 50,
        y: height - 200,
        size: 11,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      
      page.drawText('tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim', {
        x: 50,
        y: height - 220,
        size: 11,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      
      // Apply watermark using current configuration
      const watermarkText = watermarkConfig.text.replace('{firm_name}', 'Preview Firm');
      const watermarkOpacity = Math.min(Math.max(watermarkConfig.opacity, 0.1), 1.0);
      const fontSize = watermarkConfig.fontSize || 48;
      const watermarkColor = this.getWatermarkColor(watermarkConfig.color || 'gray');
      const rotation = watermarkConfig.rotation || 45;
      
      const textWidth = helveticaBold.widthOfTextAtSize(watermarkText, fontSize);
      const position = this.getWatermarkPosition(watermarkConfig.position || 'diagonal', width, height, textWidth, fontSize);
      
      page.drawText(watermarkText, {
        x: position.x,
        y: position.y,
        size: fontSize,
        font: helveticaBold,
        color: watermarkColor,
        opacity: watermarkOpacity,
        rotate: watermarkConfig.position === 'diagonal' ? degrees(rotation) : degrees(0),
      });
      
      const pdfBytes = await pdfDoc.save();
      return Buffer.from(pdfBytes);
    } catch (error) {
      this.logger.error(`Failed to generate watermark preview: ${error.message}`, error.stack);
      throw error;
    }
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