import { Injectable, Logger } from '@nestjs/common';
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';

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

  async applyWatermark(pdfBuffer: Buffer, options: WatermarkOptions): Promise<Buffer> {
    try {
      this.logger.log(`Applying watermark for share ${options.shareId} - ${options.firmName} to ${options.recipientFirm}`);
      this.logger.log(`Confidentiality level: ${options.confidentialityLevel}`);
      
      // Watermarking functionality now active with pdf-lib
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      const pages = pdfDoc.getPages();
      
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
        
        // Diagonal confidentiality watermark
        if (options.confidentialityLevel === 'confidential' || options.confidentialityLevel === 'privileged') {
          page.drawText('CONFIDENTIAL', {
            x: width / 2 - 100,
            y: height / 2,
            size: 48,
            font: helveticaBold,
            color: rgb(0.9, 0.9, 0.9),
            rotate: degrees(45)
          });
        }
        
        // Work product protection notice
        if (options.confidentialityLevel === 'work_product') {
          page.drawText('ATTORNEY WORK PRODUCT', {
            x: width / 2 - 150,
            y: height / 2,
            size: 36,
            font: helveticaBold,
            color: rgb(0.9, 0.9, 0.9),
            rotate: degrees(45),
          });
        }
      }
      
      const watermarkedPdf = await pdfDoc.save();
      this.logger.log(`Applied watermark to PDF for share ${options.shareId}`);
      return Buffer.from(watermarkedPdf);
    } catch (error) {
      this.logger.error(`Failed to apply watermark: ${error.message}`, error.stack);
      return pdfBuffer;
    }
  }

  async shouldApplyWatermark(mimeType: string, isExternalShare: boolean): Promise<boolean> {
    return mimeType === 'application/pdf' && isExternalShare;
  }
}