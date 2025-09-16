import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OpaConfig {
  constructor(private configService: ConfigService) {}

  get baseUrl(): string {
    return this.configService.get('OPA_BASE_URL') || this.configService.get('OPA_URL', 'http://opa:8181').replace('/v1/data/dms/authz', '');
  }

  get queryEndpoint(): string {
    return `${this.baseUrl}/v1/data`;
  }

  get policyPackage(): string {
    return this.configService.get('OPA_POLICY_PACKAGE', 'dms/authz');
  }

  get enabled(): boolean {
    return this.configService.get('OPA_ENABLED', 'true') === 'true';
  }

  get timeout(): number {
    return parseInt(this.configService.get('OPA_TIMEOUT', '5000'), 10);
  }
}