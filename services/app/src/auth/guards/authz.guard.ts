import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { OpaService, AuthzRequest } from '../opa.service';
import { UserInfo } from '../auth.service';

export interface RequirePermission {
  action: string;
  resource: string;
  resourceId?: string;
}

export const REQUIRE_PERMISSION_KEY = 'requirePermission';

@Injectable()
export class AuthzGuard implements CanActivate {
  private readonly logger = new Logger(AuthzGuard.name);

  constructor(
    private opaService: OpaService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.get<RequirePermission>(
      REQUIRE_PERMISSION_KEY,
      context.getHandler(),
    );

    if (!requiredPermission) {
      // No specific permission required, allow if authenticated
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = (request as any).user as UserInfo;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Build authorization request
    const resourceAttributes = await this.extractResourceAttributes(request, requiredPermission);
    const resource: any = {
      type: requiredPermission.resource,
      id: requiredPermission.resourceId || this.extractResourceId(request),
      attributes: resourceAttributes,
    };

    // For client creation/update, set firm_id at resource level for OPA policy matching
    if (requiredPermission.resource === 'client' && requiredPermission.action === 'write' && request.method === 'POST') {
      resource.firm_id = user.firm_id;
    }

    const authzRequest: AuthzRequest = {
      user,
      action: requiredPermission.action,
      resource,
      context: {
        method: request.method,
        path: request.path,
        ip: request.ip,
        userAgent: request.get('User-Agent'),
      },
    };

    try {
      const authzResponse = await this.opaService.authorize(authzRequest);
      
      if (!authzResponse.allowed) {
        this.logger.warn(
          `Authorization denied for user ${user.sub}: ${authzResponse.reason}`,
          {
            user: user.sub,
            action: requiredPermission.action,
            resource: requiredPermission.resource,
            reason: authzResponse.reason,
          },
        );
        throw new ForbiddenException(authzResponse.reason || 'Access denied');
      }

      // Store obligations in request for later use
      if (authzResponse.obligations) {
        (request as any).authzObligations = authzResponse.obligations;
      }

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      
      this.logger.error('Authorization check failed:', error);
      throw new ForbiddenException('Authorization check failed');
    }
  }

  private extractResourceId(request: Request): string | undefined {
    // Try to extract resource ID from route parameters
    const params = (request as any).params;
    return params?.id || params?.resourceId || params?.documentId || params?.matterId || params?.clientId;
  }

  private async extractResourceAttributes(
    request: Request,
    permission: RequirePermission,
  ): Promise<Record<string, any>> {
    const attributes: Record<string, any> = {};
    
    // Add request body data if available
    if (request.body) {
      attributes.requestData = request.body;
    }

    // Add query parameters
    if (request.query) {
      attributes.queryParams = request.query;
    }

    // For specific resource types, try to fetch additional attributes
    // This would be implemented based on your specific needs
    switch (permission.resource) {
      case 'document':
        // Could fetch document metadata for more context
        break;
      case 'matter':
        // Could fetch matter details
        break;
      case 'client':
        // Could fetch client information
        break;
    }

    return attributes;
  }
}