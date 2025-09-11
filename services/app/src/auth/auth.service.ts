import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

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
      const jwt = await import('jose');
      const publicKey = await this.getKeycloakPublicKey();
      const { payload } = await jwt.jwtVerify(token, publicKey);

      // Extract user information from JWT payload
      const userInfo: UserInfo = {
        sub: payload.sub as string,
        email: payload.email as string,
        preferred_username: payload.preferred_username as string,
        given_name: payload.given_name as string,
        family_name: payload.family_name as string,
        name: payload.name as string,
        roles: this.extractRoles(payload),
        firm_id: payload.firm_id as string,
        attributes: payload.attributes as Record<string, any>,
      };

      return userInfo;
    } catch (error) {
      this.logger.error('Token validation failed:', error);
      throw new UnauthorizedException('Invalid token');
    }
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
    const authEndpoint = `${this.getKeycloakBaseUrl()}/protocol/openid-connect/auth`;
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
    const logoutEndpoint = `${this.getKeycloakBaseUrl()}/protocol/openid-connect/logout`;
    
    if (redirectUri) {
      const params = new URLSearchParams();
      params.append('redirect_uri', redirectUri);
      return `${logoutEndpoint}?${params.toString()}`;
    }
    
    return logoutEndpoint;
  }

  private async getKeycloakPublicKey(): Promise<any> {
    if (this.keycloakPublicKey) {
      return this.keycloakPublicKey;
    }

    try {
      const certsEndpoint = `${this.getKeycloakBaseUrl()}/protocol/openid-connect/certs`;
      const response = await fetch(certsEndpoint);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch Keycloak public keys: ${response.statusText}`);
      }

      const jwks = await response.json() as any;
      
      // For simplicity, use the first key. In production, you'd match by kid
      if (jwks.keys && jwks.keys.length > 0) {
        const jwt = await import('jose');
        const key = jwks.keys[0];
        this.keycloakPublicKey = await jwt.importJWK(key);
        return this.keycloakPublicKey;
      }

      throw new Error('No public keys found in Keycloak JWKS');
    } catch (error) {
      this.logger.error('Failed to fetch Keycloak public key:', error);
      throw new Error('Failed to fetch Keycloak public key');
    }
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