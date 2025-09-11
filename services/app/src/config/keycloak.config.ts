import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class KeycloakConfig {
  constructor(private configService: ConfigService) {}

  get config() {
    return {
      realm: this.configService.get('KEYCLOAK_REALM', 'dms'),
      authServerUrl: this.configService.get('KEYCLOAK_AUTH_SERVER_URL', 'http://keycloak:8080'),
      sslRequired: this.configService.get('KEYCLOAK_SSL_REQUIRED', 'none'),
      resource: this.configService.get('KEYCLOAK_CLIENT_ID', 'dms-api'),
      clientId: this.configService.get('KEYCLOAK_CLIENT_ID', 'dms-api'),
      publicClient: false,
      confidentialPort: 0,
      credentials: {
        secret: this.configService.get('KEYCLOAK_CLIENT_SECRET', 'dms-secret'),
      },
      bearerOnly: false,
      checkLoginIframe: false,
      
      // Session configuration
      cookieKey: 'keycloak-token',
      store: null, // Will be set to session store
    };
  }

  get adminConfig() {
    return {
      baseUrl: this.configService.get('KEYCLOAK_ADMIN_URL', 'http://keycloak:8080'),
      realmName: this.configService.get('KEYCLOAK_REALM', 'dms'),
      username: this.configService.get('KEYCLOAK_ADMIN_USER', 'admin'),
      password: this.configService.get('KEYCLOAK_ADMIN_PASSWORD', 'admin'),
      grantType: 'password',
      clientId: 'admin-cli',
    };
  }

  get publicKey(): string {
    // In production, fetch this from Keycloak realm endpoint
    return this.configService.get('KEYCLOAK_PUBLIC_KEY', '');
  }

  get realmPublicKeyUrl(): string {
    const baseUrl = this.configService.get('KEYCLOAK_AUTH_SERVER_URL', 'http://keycloak:8080');
    const realm = this.configService.get('KEYCLOAK_REALM', 'dms');
    return `${baseUrl}/realms/${realm}`;
  }
}