import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface RoleGuardProps {
  children: React.ReactNode;
  roles?: string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  adminOnly?: boolean;
  permissions?: {
    canManageUsers?: boolean;
    canAccessAdmin?: boolean;
    canManageDocuments?: boolean;
    canManageMatters?: boolean;
  };
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  roles,
  requireAll = false,
  fallback = null,
  adminOnly = false,
  permissions,
}) => {
  const auth = useAuth();

  if (!auth.isAuthenticated) {
    return fallback as React.ReactElement;
  }

  // Check admin-only access
  if (adminOnly && !auth.isAdmin()) {
    return fallback as React.ReactElement;
  }

  // Check permission-based access
  if (permissions) {
    const hasPermission = Object.entries(permissions).every(([key, required]) => {
      if (!required) return true;
      
      switch (key) {
        case 'canManageUsers':
          return auth.canManageUsers();
        case 'canAccessAdmin':
          return auth.canAccessAdmin();
        case 'canManageDocuments':
          return auth.canManageDocuments();
        case 'canManageMatters':
          return auth.canManageMatters();
        default:
          return true;
      }
    });

    if (!hasPermission) {
      return fallback as React.ReactElement;
    }
  }

  // Check role-based access
  if (roles && roles.length > 0) {
    const hasAccess = requireAll 
      ? roles.every(role => auth.hasRole(role))
      : auth.hasAnyRole(roles);
    
    if (!hasAccess) {
      return fallback as React.ReactElement;
    }
  }

  return children as React.ReactElement;
};

// Convenience components for common patterns
export const AdminOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <RoleGuard adminOnly fallback={fallback}>
    {children}
  </RoleGuard>
);

export const RequireRoles: React.FC<{
  children: React.ReactNode;
  roles: string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
}> = ({ children, roles, requireAll, fallback }) => (
  <RoleGuard roles={roles} requireAll={requireAll} fallback={fallback}>
    {children}
  </RoleGuard>
);

export const RequirePermissions: React.FC<{
  children: React.ReactNode;
  permissions: {
    canManageUsers?: boolean;
    canAccessAdmin?: boolean;
    canManageDocuments?: boolean;
    canManageMatters?: boolean;
  };
  fallback?: React.ReactNode;
}> = ({ children, permissions, fallback }) => (
  <RoleGuard permissions={permissions} fallback={fallback}>
    {children}
  </RoleGuard>
);

// Additional convenience components from RBAC spec
export const LegalStaffOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <RoleGuard roles={['super_admin', 'firm_admin', 'legal_manager', 'legal_professional']} fallback={fallback}>
    {children}
  </RoleGuard>
);

export const SuperAdminOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <RoleGuard roles={['super_admin']} fallback={fallback}>
    {children}
  </RoleGuard>
);

export const ClientOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <RoleGuard roles={['client_user']} fallback={fallback}>
    {children}
  </RoleGuard>
);

export const RequirePermission: React.FC<{
  children: React.ReactNode;
  permission: string;
  fallback?: React.ReactNode;
}> = ({ children, permission, fallback }) => {
  const { hasPermission } = useAuth();
  
  const allowed = hasPermission(permission);
  
  return allowed ? <>{children}</> : <>{fallback}</>;
};