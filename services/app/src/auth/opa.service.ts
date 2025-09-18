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
    // Use OPA when enabled, fallback otherwise
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
            attrs: {
              firm_id: request.user.firm_id || 'system',
              clearance_level: request.user.attributes?.clearance_level || 10,
              is_partner: request.user.attributes?.is_partner || false,
              teams: request.user.attributes?.teams || [],
              ...request.user.attributes
            },
          },
          action: request.action,
          resource: request.resource,
          context: request.context || {},
        },
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.opaConfig.timeout);
      
      // Debug logging for client creation
      if (request.resource.type === 'client' && request.action === 'write') {
        this.logger.debug('OPA Request for client creation:', JSON.stringify(opaRequest, null, 2));
      }

      const response = await fetch(
        `${this.opaConfig.queryEndpoint}/${this.opaConfig.policyPackage}/decision`,
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
      
      // Handle the decision endpoint response format: {"result": {"allow": true, "reason": "..."}}
      const decision = result.result || {};
      return {
        allowed: decision.allow === true,
        reason: decision.reason,
        obligations: decision.obligations,
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
            attrs: {
              firm_id: request.user.firm_id || 'system',
              clearance_level: request.user.attributes?.clearance_level || 10,
              is_partner: request.user.attributes?.is_partner || false,
              teams: request.user.attributes?.teams || [],
              ...request.user.attributes
            },
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
    
    this.logger.debug(`Fallback authorization: ${user.sub} attempting ${action} on ${resource.type}`, {
      userRoles: user.roles,
      action,
      resourceType: resource.type
    });
    
    // Super admin can do anything
    if (user.roles.includes('super_admin')) {
      return { allowed: true, reason: 'Super admin access' };
    }

    // Firm admin can do anything within their firm
    if (user.roles.includes('firm_admin')) {
      return { allowed: true, reason: 'Firm admin access' };
    }

    // Legal professionals and managers have broad access
    if (user.roles.some(role => ['legal_professional', 'legal_manager'].includes(role))) {
      return { allowed: true, reason: 'Legal professional access' };
    }

    // Basic role-based checks for other actions
    switch (action) {
      case 'read':
      case 'list':
        if (user.roles.some(role => ['client_user', 'support_staff'].includes(role))) {
          return { allowed: true, reason: 'Read access granted' };
        }
        break;
        
      case 'write':
      case 'create':
      case 'update':
        if (user.roles.some(role => ['support_staff'].includes(role))) {
          return { allowed: true, reason: 'Write access granted' };
        }
        // Allow client users to write to client portal
        if (resource.type === 'client_portal' && user.roles.includes('client_user')) {
          return { allowed: true, reason: 'Client portal write access granted' };
        }
        break;
        
      case 'delete':
        // Only admins and managers can delete
        break;
        
      case 'admin':
        // Only admins can do admin actions
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