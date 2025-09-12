import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { MinioConfig } from '../../config/minio.config';
import * as Minio from 'minio';
import { Readable } from 'stream';

export interface UploadResult {
  etag: string;
  versionId?: string;
}

export interface ObjectInfo {
  name: string;
  size: number;
  etag: string;
  lastModified: Date;
  metaData: Record<string, string>;
}

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private client: Minio.Client | null = null;
  private externalClient: Minio.Client | null = null;
  private isInitialized = false;

  constructor(private minioConfig: MinioConfig) {}

  async onModuleInit() {
    try {
      this.client = new Minio.Client(this.minioConfig.config);
      
      // Create external client for presigned URL generation if configured
      const externalEndpoint = this.minioConfig.externalEndpoint;
      this.logger.log(`External endpoint config: ${externalEndpoint}`);
      if (externalEndpoint) {
        const url = new URL(externalEndpoint);
        this.logger.log(`Parsing external URL: ${externalEndpoint} -> host: ${url.hostname}, port: ${url.port || 'default'}`);
        const externalClientConfig = {
          endPoint: url.hostname,
          port: parseInt(url.port) || (url.protocol === 'https:' ? 443 : 80),
          useSSL: url.protocol === 'https:',
          accessKey: this.minioConfig.config.accessKey,
          secretKey: this.minioConfig.config.secretKey,
        };
        this.logger.log(`External client config: ${JSON.stringify(externalClientConfig, null, 2)}`);
        this.externalClient = new Minio.Client(externalClientConfig);
        this.logger.log(`External MinIO client configured for ${externalEndpoint}`);
      } else {
        this.logger.log(`No external endpoint configured, using internal client for URLs`);
      }
      
      await this.ensureBucketExists();
      this.isInitialized = true;
      this.logger.log('MinIO service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize MinIO service:', error);
      this.logger.warn('MinIO service will continue with limited functionality');
    }
  }

  private getClient(): Minio.Client {
    if (!this.client) {
      throw new Error('MinIO client not initialized');
    }
    return this.client;
  }

  private async ensureBucketExists(): Promise<void> {
    try {
      const bucketName = this.minioConfig.bucketName;
      const client = this.getClient();
      const exists = await client.bucketExists(bucketName);
      
      if (!exists) {
        await client.makeBucket(bucketName, this.minioConfig.region);
        this.logger.log(`Created bucket: ${bucketName}`);
        
        // Set bucket policy for document access
        await this.setBucketPolicy(bucketName);
      }
    } catch (error) {
      this.logger.error('Failed to ensure bucket exists:', error);
      throw error;
    }
  }

  private async setBucketPolicy(bucketName: string): Promise<void> {
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${bucketName}/public/*`],
        },
      ],
    };

    try {
      const client = this.getClient();
      await client.setBucketPolicy(bucketName, JSON.stringify(policy));
      this.logger.log(`Set bucket policy for: ${bucketName}`);
    } catch (error) {
      this.logger.warn('Failed to set bucket policy:', error);
    }
  }

  async uploadFile(
    objectKey: string,
    buffer: Buffer,
    metadata: Record<string, string> = {},
  ): Promise<UploadResult> {
    try {
      const stream = Readable.from(buffer);
      const bucketName = this.minioConfig.bucketName;
      
      const uploadInfo = await this.getClient().putObject(
        bucketName,
        objectKey,
        stream,
        buffer.length,
        metadata,
      );

      this.logger.log(`Uploaded file: ${objectKey} (${buffer.length} bytes)`);
      
      return {
        etag: uploadInfo.etag,
        versionId: uploadInfo.versionId,
      };
    } catch (error) {
      this.logger.error(`Failed to upload file ${objectKey}:`, error);
      throw error;
    }
  }

  async downloadFile(objectKey: string): Promise<Buffer> {
    try {
      const bucketName = this.minioConfig.bucketName;
      const stream = await this.getClient().getObject(bucketName, objectKey);
      
      const chunks: Buffer[] = [];
      return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
      });
    } catch (error) {
      this.logger.error(`Failed to download file ${objectKey}:`, error);
      throw error;
    }
  }

  async getFileInfo(objectKey: string): Promise<ObjectInfo> {
    try {
      const bucketName = this.minioConfig.bucketName;
      const stat = await this.getClient().statObject(bucketName, objectKey);
      
      return {
        name: objectKey,
        size: stat.size,
        etag: stat.etag,
        lastModified: stat.lastModified,
        metaData: stat.metaData,
      };
    } catch (error) {
      this.logger.error(`Failed to get file info ${objectKey}:`, error);
      throw error;
    }
  }

  async deleteFile(objectKey: string): Promise<void> {
    try {
      const bucketName = this.minioConfig.bucketName;
      await this.getClient().removeObject(bucketName, objectKey);
      this.logger.log(`Deleted file: ${objectKey}`);
    } catch (error) {
      this.logger.error(`Failed to delete file ${objectKey}:`, error);
      throw error;
    }
  }

  async generatePresignedUrl(
    objectKey: string,
    expiry: number = 7 * 24 * 60 * 60, // 7 days in seconds
  ): Promise<string> {
    try {
      const bucketName = this.minioConfig.bucketName;
      const url = await this.getClient().presignedGetObject(bucketName, objectKey, expiry);
      this.logger.log(`Generated presigned URL: ${url}`);
      return url;
    } catch (error) {
      this.logger.error(`Failed to generate presigned URL for ${objectKey}:`, error);
      throw error;
    }
  }

  async copyFile(sourceKey: string, destinationKey: string): Promise<UploadResult> {
    try {
      const bucketName = this.minioConfig.bucketName;
      const copyConditions = new Minio.CopyConditions();
      
      const uploadInfo = await this.getClient().copyObject(
        bucketName,
        destinationKey,
        `/${bucketName}/${sourceKey}`,
        copyConditions,
      );

      this.logger.log(`Copied file: ${sourceKey} -> ${destinationKey}`);
      
      return {
        etag: uploadInfo.etag,
        versionId: (uploadInfo as any).versionId,
      };
    } catch (error) {
      this.logger.error(`Failed to copy file ${sourceKey} -> ${destinationKey}:`, error);
      throw error;
    }
  }

  async listFiles(prefix: string = '', maxKeys: number = 1000): Promise<ObjectInfo[]> {
    try {
      const bucketName = this.minioConfig.bucketName;
      const objects: ObjectInfo[] = [];
      
      return new Promise((resolve, reject) => {
        const stream = this.getClient().listObjects(bucketName, prefix, false);
        
        stream.on('data', (obj) => {
          objects.push({
            name: obj.name,
            size: obj.size,
            etag: obj.etag,
            lastModified: obj.lastModified,
            metaData: {},
          });
        });
        
        stream.on('end', () => resolve(objects.slice(0, maxKeys)));
        stream.on('error', reject);
      });
    } catch (error) {
      this.logger.error(`Failed to list files with prefix ${prefix}:`, error);
      throw error;
    }
  }
}