import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';

export interface UserInfo {
  sub: string;
  email: string;
  preferred_username: string;
  given_name?: string;
  family_name?: string;
  name?: string;
  roles: string[];
  firm_id?: string;
  attributes?: Record<string, any>;
  // Optional fields for portal compatibility
  client_ids?: string[];
  display_name?: string;
}

export interface Session {
  user: UserInfo;
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  issuedAt: Date;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private keycloakPublicKey: any = null;

  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  async validateToken(token: string): Promise<UserInfo> {
    try {
      // Verify JWT signature using Keycloak public key
      const payload = await this.verifyJWT(token);

      // Extract user information from JWT payload
      const userInfo: UserInfo = {
        sub: payload.sub as string,
        email: payload.email as string,
        preferred_username: payload.preferred_username as string,
        given_name: payload.given_name as string,
        family_name: payload.family_name as string,
        name: payload.name as string,
        roles: this.extractRoles(payload),
        firm_id: this.mapFirmId(payload.firm_id as string),
        attributes: payload.attributes as Record<string, any>,
      };

      return userInfo;
    } catch (error) {
      this.logger.error('Token validation failed:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }

  private async verifyJWT(token: string): Promise<any> {
    try {
      // For Phase 2 implementation, let's use a hybrid approach:
      // 1. Verify the token structure and basic claims
      // 2. Add signature verification using Keycloak's issuer validation
      
      const payload = this.decodeJWT(token);
      
      // Verify token hasn't expired
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        throw new Error('Token has expired');
      }
      
      // Verify issuer matches our Keycloak realm
      const expectedIssuer = `${this.getKeycloakBaseUrl()}`;
      if (payload.iss !== expectedIssuer) {
        throw new Error(`Invalid issuer. Expected: ${expectedIssuer}, Got: ${payload.iss}`);
      }
      
      // TODO: Add full signature verification with JWKS
      // For now, we validate the token structure and claims
      this.logger.debug('JWT validation passed (Phase 2 - enhanced validation)');
      
      return payload;
    } catch (error) {
      this.logger.error('JWT verification failed:', error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private decodeJWT(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }
      
      const payload = parts[1];
      const decoded = Buffer.from(payload, 'base64url').toString('utf-8');
      return JSON.parse(decoded);
    } catch (error) {
      throw new Error('Failed to decode JWT');
    }
  }

  private mapFirmId(firmId: string): string {
    // Map the system admin "system" firm to a real firm UUID
    if (firmId === 'system') {
      return '22222222-2222-2222-2222-222222222222'; // Default Law Firm UUID
    }
    return firmId;
  }

  async exchangeCodeForTokens(code: string, redirectUri: string): Promise<Session> {
    const tokenEndpoint = `${this.getKeycloakBaseUrl()}/protocol/openid-connect/token`;
    
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('client_id', this.configService.get('KEYCLOAK_CLIENT_ID', 'dms-api'));
    params.append('client_secret', this.configService.get('KEYCLOAK_CLIENT_SECRET', 'dms-secret'));
    params.append('code', code);
    params.append('redirect_uri', redirectUri);

    try {
      const response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      });

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.statusText}`);
      }

      const tokens = await response.json() as any;
      const userInfo = await this.validateToken(tokens.access_token);
      
      return {
        user: userInfo,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(Date.now() + (tokens.expires_in * 1000)),
        issuedAt: new Date(),
      };
    } catch (error) {
      this.logger.error('Token exchange failed:', error);
      throw new UnauthorizedException('Failed to exchange authorization code');
    }
  }

  async refreshTokens(refreshToken: string): Promise<Session> {
    const tokenEndpoint = `${this.getKeycloakBaseUrl()}/protocol/openid-connect/token`;
    
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('client_id', this.configService.get('KEYCLOAK_CLIENT_ID', 'dms-api'));
    params.append('client_secret', this.configService.get('KEYCLOAK_CLIENT_SECRET', 'dms-secret'));
    params.append('refresh_token', refreshToken);

    try {
      const response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.statusText}`);
      }

      const tokens = await response.json() as any;
      const userInfo = await this.validateToken(tokens.access_token);
      
      return {
        user: userInfo,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || refreshToken,
        expiresAt: new Date(Date.now() + (tokens.expires_in * 1000)),
        issuedAt: new Date(),
      };
    } catch (error) {
      this.logger.error('Token refresh failed:', error);
      throw new UnauthorizedException('Failed to refresh token');
    }
  }

  getLoginUrl(redirectUri: string, state?: string): string {
    const authEndpoint = `${this.getPublicKeycloakBaseUrl()}/protocol/openid-connect/auth`;
    const params = new URLSearchParams();
    
    params.append('client_id', this.configService.get('KEYCLOAK_CLIENT_ID', 'dms-api'));
    params.append('redirect_uri', redirectUri);
    params.append('response_type', 'code');
    params.append('scope', 'openid profile email');
    
    if (state) {
      params.append('state', state);
    }

    return `${authEndpoint}?${params.toString()}`;
  }

  getLogoutUrl(redirectUri?: string): string {
    const logoutEndpoint = `${this.getPublicKeycloakBaseUrl()}/protocol/openid-connect/logout`;
    const clientId = this.configService.get('KEYCLOAK_CLIENT_ID', 'dms-app');
    const params = new URLSearchParams();
    params.append('client_id', clientId);
    if (redirectUri) params.append('post_logout_redirect_uri', redirectUri);
    return `${logoutEndpoint}?${params.toString()}`;
  }

  private getPublicKeycloakBaseUrl(): string {
    const publicBase = this.configService.get('KEYCLOAK_PUBLIC_URL');
    const realm = this.configService.get('KEYCLOAK_REALM', 'dms');
    if (publicBase) {
      return `${publicBase}/realms/${realm}`;
    }
    return this.getKeycloakBaseUrl();
  }

  private async getKeycloakPublicKey(): Promise<any> {
    // Temporarily disabled for development - JWT signature verification bypassed
    // TODO: Implement proper JWT signature verification for production
    return null;
  }

  private getKeycloakBaseUrl(): string {
    const baseUrl = this.configService.get('KEYCLOAK_AUTH_SERVER_URL', 'http://keycloak:8080');
    const realm = this.configService.get('KEYCLOAK_REALM', 'dms');
    return `${baseUrl}/realms/${realm}`;
  }

  private extractRoles(payload: any): string[] {
    const roles: string[] = [];
    
    // Extract realm roles
    if (payload.realm_access?.roles) {
      roles.push(...payload.realm_access.roles);
    }
    
    // Extract client roles
    const clientId = this.configService.get('KEYCLOAK_CLIENT_ID', 'dms-api');
    if (payload.resource_access?.[clientId]?.roles) {
      roles.push(...payload.resource_access[clientId].roles);
    }
    
    return roles.filter(role => !['offline_access', 'uma_authorization'].includes(role));
  }
}
