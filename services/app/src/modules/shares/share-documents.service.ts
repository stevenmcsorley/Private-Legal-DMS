import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from 'express';
import { MatterShare } from '../../common/entities/matter-share.entity';
import { Document } from '../../common/entities/document.entity';
import { User, Firm } from '../../common/entities';
import { WatermarkService } from '../documents/services/watermark.service';
import { MinioService } from '../../common/services/minio.service';

@Injectable()
export class ShareDocumentsService {
  private readonly logger = new Logger(ShareDocumentsService.name);

  constructor(
    @InjectRepository(MatterShare)
    private readonly shareRepository: Repository<MatterShare>,
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(Firm)
    private readonly firmRepository: Repository<Firm>,
    private readonly watermarkService: WatermarkService,
    private readonly minioService: MinioService,
  ) {}

  async streamSharedDocument(
    shareId: string,
    documentId: string,
    user: User,
    response: Response,
  ): Promise<void> {
    const { share, document, isExternal } = await this.validateShareAccess(
      shareId,
      documentId,
      user,
    );

    try {
      // Get document from MinIO
      const documentBuffer = await this.minioService.downloadFile(document.object_key);
      
      // Apply watermarking if this is an external share of a PDF
      let processedBuffer = documentBuffer;
      let isWatermarked = false;

      if (await this.watermarkService.shouldApplyWatermark(document.mime_type, isExternal)) {
        const sharedByFirm = await this.firmRepository.findOne({
          where: { id: share.shared_by_user.firm_id },
        });

        const sharedWithFirm = await this.firmRepository.findOne({
          where: { id: share.shared_with_firm },
        });

        if (sharedByFirm && sharedWithFirm) {
          processedBuffer = await this.watermarkService.applyWatermark(documentBuffer, {
            firmName: sharedByFirm.name,
            shareId: shareId,
            recipientFirm: sharedWithFirm.name,
            confidentialityLevel: this.getConfidentialityLevel(document),
            timestamp: new Date(),
          });
          isWatermarked = true;
        }
      }

      // Set response headers
      response.set({
        'Content-Type': document.mime_type,
        'Content-Length': processedBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Watermarked': isWatermarked ? 'true' : 'false',
      });

      // Stream the document
      response.send(processedBuffer);

      // Log access
      this.logger.log(
        `Document ${documentId} accessed via share ${shareId} by user ${user.id} (watermarked: ${isWatermarked})`,
      );

    } catch (error) {
      this.logger.error(
        `Failed to stream shared document ${documentId}: ${error.message}`,
        error.stack,
      );
      throw new NotFoundException('Document not found');
    }
  }

  async downloadSharedDocument(
    shareId: string,
    documentId: string,
    user: User,
    response: Response,
  ): Promise<void> {
    const { share, document, isExternal } = await this.validateShareAccess(
      shareId,
      documentId,
      user,
    );

    try {
      // Get document from MinIO
      const documentBuffer = await this.minioService.downloadFile(document.object_key);
      
      // Apply watermarking if this is an external share of a PDF
      let processedBuffer = documentBuffer;
      let isWatermarked = false;
      let filename = document.original_filename;

      if (await this.watermarkService.shouldApplyWatermark(document.mime_type, isExternal)) {
        const sharedByFirm = await this.firmRepository.findOne({
          where: { id: share.shared_by_user.firm_id },
        });

        const sharedWithFirm = await this.firmRepository.findOne({
          where: { id: share.shared_with_firm },
        });

        if (sharedByFirm && sharedWithFirm) {
          processedBuffer = await this.watermarkService.applyWatermark(documentBuffer, {
            firmName: sharedByFirm.name,
            shareId: shareId,
            recipientFirm: sharedWithFirm.name,
            confidentialityLevel: this.getConfidentialityLevel(document),
            timestamp: new Date(),
          });
          isWatermarked = true;
          // Add watermark suffix to filename
          const ext = filename.split('.').pop();
          const nameWithoutExt = filename.replace(`.${ext}`, '');
          filename = `${nameWithoutExt}_watermarked.${ext}`;
        }
      }

      // Set download headers
      response.set({
        'Content-Type': document.mime_type,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': processedBuffer.length.toString(),
        'X-Watermarked': isWatermarked ? 'true' : 'false',
      });

      // Send the document
      response.send(processedBuffer);

      // Log download
      this.logger.log(
        `Document ${documentId} downloaded via share ${shareId} by user ${user.id} (watermarked: ${isWatermarked})`,
      );

    } catch (error) {
      this.logger.error(
        `Failed to download shared document ${documentId}: ${error.message}`,
        error.stack,
      );
      throw new NotFoundException('Document not found');
    }
  }

  private async validateShareAccess(
    shareId: string,
    documentId: string,
    user: User,
  ): Promise<{ share: MatterShare; document: Document; isExternal: boolean }> {
    // Find the share
    const share = await this.shareRepository.findOne({
      where: { id: shareId },
      relations: ['matter', 'shared_by_user'],
    });

    if (!share) {
      throw new NotFoundException('Share not found');
    }

    // Check if share is still valid
    if (share.isRevoked()) {
      throw new ForbiddenException('Share has been revoked');
    }

    if (share.isExpired()) {
      throw new ForbiddenException('Share has expired');
    }

    // Find the document
    const document = await this.documentRepository.findOne({
      where: { 
        id: documentId,
        matter_id: share.matter_id,
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found in shared matter');
    }

    // Check if user has access to this share
    const userFirmId = user.firm_id;
    const isOwner = share.shared_by_user.firm_id === userFirmId;
    const isRecipient = share.shared_with_firm === userFirmId;
    
    if (!isOwner && !isRecipient) {
      throw new ForbiddenException('Access denied to this share');
    }

    // Determine if this is an external access (recipient firm accessing owner's documents)
    const isExternal = !isOwner && isRecipient;

    return { share, document, isExternal };
  }

  private getConfidentialityLevel(document: Document): 'confidential' | 'privileged' | 'work_product' {
    if (document.metadata?.privileged) return 'privileged';
    if (document.metadata?.work_product) return 'work_product';
    if (document.metadata?.confidential) return 'confidential';
    return 'confidential'; // Default to confidential for external shares
  }
}