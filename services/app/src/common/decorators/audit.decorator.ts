import { SetMetadata } from '@nestjs/common';

export interface AuditOptions {
  action: string;
  resourceType: string;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  includeRequest?: boolean;
  includeResponse?: boolean;
  skipOnError?: boolean;
}

export const AUDIT_METADATA_KEY = 'audit';

/**
 * Decorator to mark methods for audit logging
 * 
 * @param options Audit configuration options
 * 
 * @example
 * @Audit({
 *   action: 'document_confidential_access',
 *   resourceType: 'document',
 *   riskLevel: 'high'
 * })
 * async getConfidentialDocument(id: string) {
 *   // method implementation
 * }
 */
export const Audit = (options: AuditOptions) => SetMetadata(AUDIT_METADATA_KEY, options);