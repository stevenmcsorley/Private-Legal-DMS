import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

export interface DocumentProcessingJobData {
  documentId: string;
  documentPath: string;
  originalFilename: string;
  mimeType: string;
  userId: string;
  firmId: string;
}

export interface VirusScanJobData {
  documentId: string;
  documentPath: string;
  originalFilename: string;
  userId: string;
  firmId: string;
}

export interface OCRJobData {
  documentId: string;
  documentPath: string;
  originalFilename: string;
  mimeType: string;
  userId: string;
  firmId: string;
}

@Injectable()
export class DocumentProcessingQueue {
  private readonly logger = new Logger(DocumentProcessingQueue.name);

  constructor(
    @InjectQueue('document-processing') private documentQueue: Queue,
  ) {}

  async addTextExtractionJob(data: DocumentProcessingJobData): Promise<void> {
    this.logger.log(`Queuing text extraction for document ${data.documentId}`);
    
    await this.documentQueue.add('extract-text', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: 10,
      removeOnFail: 5,
    });
  }

  async addVirusScanJob(data: VirusScanJobData): Promise<void> {
    this.logger.log(`Queuing virus scan for document ${data.documentId}`);
    
    await this.documentQueue.add('virus-scan', data, {
      attempts: 3,
      priority: 10, // Higher priority for security
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: 10,
      removeOnFail: 5,
    });
  }

  async addOCRJob(data: OCRJobData): Promise<void> {
    this.logger.log(`Queuing OCR processing for document ${data.documentId}`);
    
    await this.documentQueue.add('ocr-process', data, {
      attempts: 2,
      delay: 500, // Small delay after text extraction fails
      backoff: {
        type: 'exponential',
        delay: 3000,
      },
      removeOnComplete: 10,
      removeOnFail: 5,
    });
  }

  async addSearchIndexJob(data: DocumentProcessingJobData): Promise<void> {
    this.logger.log(`Queuing search indexing for document ${data.documentId}`);
    
    await this.documentQueue.add('index-document', data, {
      attempts: 3,
      delay: 10000, // 10 second delay to ensure text extraction and OCR complete first
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: 10,
      removeOnFail: 5,
    });
  }

  async triggerReindexAfterOCR(data: DocumentProcessingJobData): Promise<void> {
    this.logger.log(`Triggering re-index after OCR completion for document ${data.documentId}`);
    
    await this.documentQueue.add('index-document', data, {
      attempts: 3,
      delay: 500, // Quick reindex after OCR
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: 10,
      removeOnFail: 5,
    });
  }

  async getJobStatus(jobId: string): Promise<any> {
    const job = await this.documentQueue.getJob(jobId);
    if (!job) {
      return null;
    }

    return {
      id: job.id,
      name: job.name,
      progress: job.progress(),
      data: job.data,
      finishedOn: job.finishedOn,
      processedOn: job.processedOn,
      failedReason: job.failedReason,
      returnvalue: job.returnvalue,
    };
  }

  async getDocumentJobs(documentId: string): Promise<any[]> {
    const waiting = await this.documentQueue.getWaiting();
    const active = await this.documentQueue.getActive();
    const completed = await this.documentQueue.getCompleted();
    const failed = await this.documentQueue.getFailed();

    const allJobs = [...waiting, ...active, ...completed, ...failed];
    
    return allJobs
      .filter(job => job.data.documentId === documentId)
      .map(job => ({
        id: job.id,
        name: job.name,
        progress: job.progress(),
        data: job.data,
        finishedOn: job.finishedOn,
        processedOn: job.processedOn,
        failedReason: job.failedReason,
        returnvalue: job.returnvalue,
      }));
  }
}