import { Injectable, Logger } from '@nestjs/common';
import { OpaConfig } from '../config/opa.config';
import { UserInfo } from './auth.service';

export interface AuthzRequest {
  user: UserInfo;
  action: string;
  resource: {
    type: string;
    id?: string;
    attributes?: Record<string, any>;
  };
  context?: Record<string, any>;
}

export interface AuthzResponse {
  allowed: boolean;
  reason?: string;
  obligations?: Record<string, any>;
}

@Injectable()
export class OpaService {
  private readonly logger = new Logger(OpaService.name);

  constructor(private opaConfig: OpaConfig) {}

  async authorize(request: AuthzRequest): Promise<AuthzResponse> {
    if (!this.opaConfig.enabled) {
      // When OPA is disabled, use basic role-based fallback
      return this.basicAuthzFallback(request);
    }

    try {
      const opaRequest = {
        input: {
          user: {
            id: request.user.sub,
            email: request.user.email,
            roles: request.user.roles,
            firm_id: request.user.firm_id,
            attributes: request.user.attributes || {},
          },
          action: request.action,
          resource: request.resource,
          context: request.context || {},
        },
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.opaConfig.timeout);
      
      const response = await fetch(
        `${this.opaConfig.queryEndpoint}/${this.opaConfig.policyPackage}/allow`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(opaRequest),
          signal: controller.signal,
        },
      );
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        this.logger.error(`OPA request failed: ${response.status} ${response.statusText}`);
        return { allowed: false, reason: 'Authorization service unavailable' };
      }

      const result = await response.json() as any;
      
      return {
        allowed: result.result === true,
        reason: result.reason,
        obligations: result.obligations,
      };
    } catch (error) {
      this.logger.error('OPA authorization failed:', error);
      // Fallback to basic authorization on OPA failure
      return this.basicAuthzFallback(request);
    }
  }

  async authorizeMultiple(requests: AuthzRequest[]): Promise<AuthzResponse[]> {
    if (!this.opaConfig.enabled) {
      return requests.map(req => this.basicAuthzFallback(req));
    }

    try {
      const opaRequests = requests.map(request => ({
        input: {
          user: {
            id: request.user.sub,
            email: request.user.email,
            roles: request.user.roles,
            firm_id: request.user.firm_id,
            attributes: request.user.attributes || {},
          },
          action: request.action,
          resource: request.resource,
          context: request.context || {},
        },
      }));

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.opaConfig.timeout);
      
      const response = await fetch(
        `${this.opaConfig.queryEndpoint}/${this.opaConfig.policyPackage}/batch`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ inputs: opaRequests }),
          signal: controller.signal,
        },
      );
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        this.logger.error(`OPA batch request failed: ${response.status} ${response.statusText}`);
        return requests.map(req => ({ allowed: false, reason: 'Authorization service unavailable' }));
      }

      const result = await response.json() as any;
      
      return result.results?.map((res: any) => ({
        allowed: res.allow === true,
        reason: res.reason,
        obligations: res.obligations,
      })) || requests.map(() => ({ allowed: false, reason: 'Invalid response from authorization service' }));
    } catch (error) {
      this.logger.error('OPA batch authorization failed:', error);
      return requests.map(req => this.basicAuthzFallback(req));
    }
  }

  private basicAuthzFallback(request: AuthzRequest): AuthzResponse {
    const { user, action, resource } = request;
    
    // Super admin can do anything
    if (user.roles.includes('super_admin')) {
      return { allowed: true, reason: 'Super admin access' };
    }

    // Firm admin can do anything within their firm
    if (user.roles.includes('firm_admin') && this.isSameFirmResource(user, resource)) {
      return { allowed: true, reason: 'Firm admin access' };
    }

    // Basic role-based checks
    switch (action) {
      case 'read':
        if (user.roles.some(role => ['legal_professional', 'legal_manager', 'client_user'].includes(role))) {
          return { allowed: true, reason: 'Read access granted' };
        }
        break;
        
      case 'write':
      case 'update':
        if (user.roles.some(role => ['legal_professional', 'legal_manager'].includes(role))) {
          return { allowed: true, reason: 'Write access granted' };
        }
        break;
        
      case 'delete':
        if (user.roles.includes('legal_manager')) {
          return { allowed: true, reason: 'Delete access granted to legal manager' };
        }
        break;
        
      case 'admin':
        if (user.roles.some(role => ['firm_admin', 'legal_manager'].includes(role))) {
          return { allowed: true, reason: 'Admin access granted' };
        }
        break;
    }

    return { 
      allowed: false, 
      reason: `Access denied: User with roles [${user.roles.join(', ')}] cannot ${action} ${resource.type}` 
    };
  }

  private isSameFirmResource(user: UserInfo, resource: { type: string; attributes?: Record<string, any> }): boolean {
    if (!user.firm_id || !resource.attributes?.firm_id) {
      return false;
    }
    return user.firm_id === resource.attributes.firm_id;
  }
}