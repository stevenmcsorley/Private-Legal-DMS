import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MinioConfig {
  constructor(private configService: ConfigService) {}

  get config() {
    // Parse endpoint to extract hostname and port
    const fullEndpoint = this.configService.get('MINIO_ENDPOINT', 'minio:9000');
    const [hostname, portStr] = fullEndpoint.split(':');
    const port = portStr ? parseInt(portStr, 10) : 9000;
    
    return {
      endPoint: hostname,
      port: port,
      useSSL: false, // Force to false for development
      accessKey: this.configService.get('MINIO_ACCESS_KEY', 'minio'),
      secretKey: this.configService.get('MINIO_SECRET_KEY', 'minio123'),
    };
  }

  get bucketName(): string {
    return this.configService.get('MINIO_BUCKET_NAME', 'documents');
  }

  get region(): string {
    return this.configService.get('MINIO_REGION', 'us-east-1');
  }
}