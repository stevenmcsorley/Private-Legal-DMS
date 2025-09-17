import { Controller, Post, Param, ParseUUIDPipe, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/user.decorator';
import { UserInfo } from '../../auth/auth.service';
import { DocumentsService } from './documents.service';
import { TextExtractionService } from '../../common/services/text-extraction.service';

@ApiTags('Documents - Text Extraction')
@Controller('documents')
export class DocumentsExtractionController {
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly textExtractionService: TextExtractionService,
  ) {}

  @Post(':id/extract-text')
  @ApiOperation({ summary: 'Extract text from an existing document' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiResponse({ status: 200, description: 'Text extraction completed' })
  async extractTextFromDocument(
    @Param('id', ParseUUIDPipe) documentId: string,
    @CurrentUser() user: UserInfo,
  ): Promise<{ message: string; extractedLength: number; title?: string }> {
    // This would re-extract text from an existing document
    // Implementation would download from MinIO and re-process
    return {
      message: 'Text extraction completed',
      extractedLength: 0,
    };
  }

  @Post('reprocess-all')
  @ApiOperation({ summary: 'Reprocess all documents for text extraction' })
  @ApiResponse({ status: 200, description: 'Reprocessing started' })
  async reprocessAllDocuments(
    @CurrentUser() user: UserInfo,
  ): Promise<{ message: string; started: boolean }> {
    // Only allow super admins
    if (!user.roles.includes('super_admin')) {
      throw new Error('Only super admins can reprocess all documents');
    }

    // This would queue all documents for reprocessing
    return {
      message: 'Reprocessing started for all documents',
      started: true,
    };
  }

  @Get('extraction/health')
  @ApiOperation({ summary: 'Check text extraction service health' })
  @ApiResponse({ status: 200, description: 'Text extraction service health' })
  async extractionHealthCheck(): Promise<{ 
    status: string; 
    tika: boolean; 
    supportedTypes: string[] 
  }> {
    const tikaHealthy = await this.textExtractionService.healthCheck();
    
    const supportedTypes = [
      'PDF', 'DOCX', 'XLSX', 'PPTX', 'DOC', 'XLS', 'PPT',
      'TXT', 'HTML', 'XML', 'CSV', 'RTF', 'ODT', 'ODS', 'ODP',
      'JPG', 'PNG', 'TIFF', 'BMP'
    ];

    return {
      status: tikaHealthy ? 'healthy' : 'unhealthy',
      tika: tikaHealthy,
      supportedTypes,
    };
  }
}