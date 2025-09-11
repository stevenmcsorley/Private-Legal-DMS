import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { AuthzGuard, RequirePermission, REQUIRE_PERMISSION_KEY } from '../guards/authz.guard';

/**
 * Decorator to require specific permissions for a route
 * 
 * @param action - The action being performed (read, write, delete, etc.)
 * @param resource - The resource type (document, matter, client, etc.)
 * @param resourceId - Optional specific resource ID (can be extracted from route params)
 */
export function RequirePermissions(action: string, resource: string, resourceId?: string) {
  const permission: RequirePermission = {
    action,
    resource,
    resourceId,
  };

  return applyDecorators(
    SetMetadata(REQUIRE_PERMISSION_KEY, permission),
    UseGuards(AuthzGuard),
  );
}

// Convenience decorators for common actions
export const CanRead = (resource: string, resourceId?: string) => 
  RequirePermissions('read', resource, resourceId);

export const CanWrite = (resource: string, resourceId?: string) => 
  RequirePermissions('write', resource, resourceId);

export const CanDelete = (resource: string, resourceId?: string) => 
  RequirePermissions('delete', resource, resourceId);

export const CanAdmin = (resource: string, resourceId?: string) => 
  RequirePermissions('admin', resource, resourceId);