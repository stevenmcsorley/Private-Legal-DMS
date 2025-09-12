import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request } from 'express';
import { AuditService } from '../services/audit.service';
import { UserInfo } from '../../auth/auth.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = (request as any).user as UserInfo | undefined;

    // Skip audit logging for certain endpoints
    if (this.shouldSkipAudit(request)) {
      return next.handle();
    }

    const startTime = Date.now();
    const auditContext = this.buildAuditContext(request, user);

    return next.handle().pipe(
      tap(() => {
        // Success case
        if (auditContext) {
          this.auditService.log({
            ...auditContext,
            outcome: 'success',
            details: {
              ...auditContext.details,
              duration_ms: Date.now() - startTime,
            },
          });
        }
      }),
      catchError((error) => {
        // Error case
        if (auditContext) {
          this.auditService.log({
            ...auditContext,
            outcome: 'failure',
            details: {
              ...auditContext.details,
              duration_ms: Date.now() - startTime,
              error: error.message,
              status_code: error.status || 500,
            },
          });
        }
        throw error;
      }),
    );
  }

  private shouldSkipAudit(request: Request): boolean {
    const path = request.path;
    const method = request.method;

    // Skip health checks, metrics, and other operational endpoints
    const skipPaths = [
      '/health',
      '/metrics',
      '/api/health',
      '/api/metrics',
      '/favicon.ico',
    ];

    // Skip GET requests to certain read-only endpoints that don't need audit
    const skipGetPaths = [
      '/api/auth/profile',
      '/api/system/status',
    ];

    if (skipPaths.some(skipPath => path.startsWith(skipPath))) {
      return true;
    }

    if (method === 'GET' && skipGetPaths.some(skipPath => path.startsWith(skipPath))) {
      return true;
    }

    return false;
  }

  private buildAuditContext(request: Request, user?: UserInfo): any {
    if (!user) {
      return null; // Skip audit if no user context
    }

    const path = request.path;
    const method = request.method;
    const { action, resourceType, resourceId, riskLevel } = this.parseEndpoint(path, method);

    if (!action) {
      return null; // Skip audit if we can't determine the action
    }

    return {
      user,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      details: {
        method,
        path,
        query: request.query,
        body_size: request.body ? JSON.stringify(request.body).length : 0,
      },
      ip_address: this.getClientIp(request),
      user_agent: request.get('User-Agent'),
      risk_level: riskLevel,
    };
  }

  private parseEndpoint(path: string, method: string): {
    action: string | null;
    resourceType: string;
    resourceId: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  } {
    const pathSegments = path.split('/').filter(segment => segment);
    
    // Default values
    let action: string | null = null;
    let resourceType = 'unknown';
    let resourceId = 'unknown';
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';

    // API endpoints
    if (pathSegments[0] === 'api') {
      resourceType = pathSegments[1] || 'unknown';
      
      // Extract resource ID if present (typically UUID format)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const idSegment = pathSegments.find(segment => uuidRegex.test(segment));
      resourceId = idSegment || 'unknown';

      // Map method + path patterns to actions
      switch (method) {
        case 'POST':
          if (pathSegments.includes('upload')) {
            action = `${resourceType}_upload`;
            riskLevel = 'low';
          } else if (pathSegments.includes('legal-hold')) {
            action = `${resourceType}_legal_hold_set`;
            riskLevel = 'high';
          } else {
            action = `${resourceType}_create`;
            riskLevel = 'low';
          }
          break;

        case 'GET':
          if (pathSegments.includes('download')) {
            action = `${resourceType}_download`;
            riskLevel = 'low';
          } else if (pathSegments.includes('preview')) {
            action = `${resourceType}_preview`;
            riskLevel = 'low';
          } else if (idSegment) {
            action = `${resourceType}_read`;
            riskLevel = 'low';
          } else {
            action = `${resourceType}_list`;
            riskLevel = 'low';
          }
          break;

        case 'PUT':
        case 'PATCH':
          action = `${resourceType}_update`;
          riskLevel = 'medium';
          break;

        case 'DELETE':
          if (pathSegments.includes('legal-hold')) {
            action = `${resourceType}_legal_hold_remove`;
            riskLevel = 'high';
          } else {
            action = `${resourceType}_delete`;
            riskLevel = 'high';
          }
          break;
      }

      // Special cases for high-risk operations
      if (resourceType === 'admin') {
        riskLevel = 'high';
      }

      if (resourceType === 'retention' || pathSegments.includes('retention')) {
        riskLevel = 'medium';
      }

      if (pathSegments.includes('bulk') || pathSegments.includes('legal-hold')) {
        riskLevel = 'critical';
      }
    }

    return { action, resourceType, resourceId, riskLevel };
  }

  private getClientIp(request: Request): string {
    return (
      (request.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      request.headers['x-real-ip'] ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress ||
      'unknown'
    ) as string;
  }
}
