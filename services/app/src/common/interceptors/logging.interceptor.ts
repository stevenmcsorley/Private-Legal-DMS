import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';

    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const { statusCode } = response;
        const contentLength = response.get('content-length');
        const duration = Date.now() - start;

        this.logger.log(
          `${method} ${url} ${statusCode} ${contentLength || 0}b - ${duration}ms - ${ip} - ${userAgent}`,
        );
      }),
    );
  }
}