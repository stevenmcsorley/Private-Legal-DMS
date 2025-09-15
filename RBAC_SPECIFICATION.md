# RBAC Specification - Legal DMS

This document defines the **authoritative** role-based access control system for the Legal DMS. This is the single source of truth for all permission mapping and role definitions.

## Current System Status

**Authentication**: ✅ Working - Keycloak OIDC with JWT tokens  
**Role Storage**: ✅ Working - Simple string arrays in user.roles field  
**Permission Checking**: ✅ Working - Direct role name checks in code  
**Frontend Components**: ❌ Missing - Need role-based UI components

## Keycloak Roles (Source of Truth)

These roles are defined in Keycloak and extracted from JWT tokens:

| Keycloak Role | Description | Current Status |
|---------------|-------------|----------------|
| `super_admin` | System-wide super administrator | ✅ Active |
| `firm_admin` | Firm administrator | ✅ Active |
| `legal_manager` | Legal manager | ✅ Active |
| `legal_professional` | Legal professional (lawyer) | ✅ Active |
| `client_user` | Client portal user | ✅ Active |
| `external_partner` | External partner from another firm | ✅ Active |
| `support_staff` | Support staff | ⚠️ Defined but not used |

## Current Database Users Audit

Based on actual system data:

| Email | Display Name | Current Roles | Status |
|-------|--------------|---------------|---------|
| smcsorl@gmail.com | supersteven | super_admin | ✅ Correct |
| superadmin@example.com | Super Admin | super_admin | ✅ Correct |
| dev@firm1.com | Development User | firm_admin | ✅ Correct |
| manager@firm1.com | Sarah Manager | legal_manager | ✅ Correct |
| lawyer@firm1.com | John Legal | legal_professional | ✅ Correct |
| demo1@demo.com | Demo 1 User | legal_professional | ✅ Correct |
| demo2@demo.com | Demo 2 User | legal_professional | ✅ Correct |
| testuser | Test User | legal_professional | ✅ Correct |
| partner@partnerlaw.com | Partner Attorney | legal_professional | ⚠️ Should be external_partner |
| client@external.com | Jane Client | client_user | ✅ Correct |

## Role Permissions Matrix

### Super Admin (`super_admin`)
- **Scope**: System-wide access
- **Permissions**:
  - ✅ Manage all firms
  - ✅ Manage all users across firms
  - ✅ Access all system settings
  - ✅ View all audit logs
  - ✅ Access all documents/matters
  - ✅ Manage retention policies
  - ✅ Manage system-wide configurations

### Firm Admin (`firm_admin`)
- **Scope**: Their firm only
- **Permissions**:
  - ✅ Manage users within their firm
  - ✅ Manage teams within their firm
  - ✅ Manage retention classes for their firm
  - ✅ View audit logs for their firm
  - ✅ Access all matters/documents in their firm
  - ✅ Manage cross-firm sharing settings
  - ✅ Export matter bundles

### Legal Manager (`legal_manager`)
- **Scope**: Team/department level
- **Permissions**:
  - ❌ **NOT IMPLEMENTED** - Supervise assigned teams
  - ❌ **NOT IMPLEMENTED** - Manage matters across teams
  - ❌ **NOT IMPLEMENTED** - Assign matters to team members
  - ✅ Create/edit matters
  - ✅ Upload/manage documents
  - ✅ Set legal holds
  - ✅ Access search functionality

### Legal Professional (`legal_professional`)
- **Scope**: Individual matter owner
- **Permissions**:
  - ✅ Create/edit own matters
  - ✅ Upload/manage documents on own matters
  - ✅ Invite clients to matters
  - ✅ Set sharing permissions
  - ✅ Set legal holds on own matters
  - ✅ Access search functionality
  - ❌ **NOT IMPLEMENTED** - Cannot manage other users' matters unless shared

### Client User (`client_user`)
- **Scope**: Assigned matters only
- **Permissions**:
  - ❌ **NOT IMPLEMENTED** - View assigned matters only
  - ❌ **NOT IMPLEMENTED** - Download permitted documents
  - ❌ **NOT IMPLEMENTED** - Upload to designated inbox
  - ❌ **NOT IMPLEMENTED** - Comment on documents
  - ❌ **LIMITED** - Current users can access all documents (BUG)

### External Partner (`external_partner`)
- **Scope**: Time-boxed shared matters
- **Permissions**:
  - ❌ **NOT IMPLEMENTED** - View shared matters with expiry
  - ❌ **NOT IMPLEMENTED** - Access shared documents only
  - ❌ **NOT IMPLEMENTED** - Upload documents to shared matters
  - ❌ **NOT IMPLEMENTED** - Time-based access expiry

### Support Staff (`support_staff`)
- **Scope**: Limited upload/edit access
- **Permissions**:
  - ❌ **NOT IMPLEMENTED** - Upload documents only
  - ❌ **NOT IMPLEMENTED** - Edit document metadata
  - ❌ **NOT IMPLEMENTED** - No policy changes
  - ❌ **NOT IMPLEMENTED** - No user management

## Current Implementation Analysis

### ✅ What's Working
1. **Authentication Flow**: Keycloak → JWT → Role extraction works correctly
2. **Basic Admin Checks**: `super_admin` and `firm_admin` role checks work
3. **Firm Isolation**: Users restricted to their firm's data (except super_admin)
4. **User Management**: Admins can create/edit users within firm scope

### ❌ Critical Gaps

#### 1. Frontend Role-Based UI (HIGH PRIORITY)
- No `RoleGuard` components to hide/show UI elements
- All users see all navigation options regardless of permissions
- No conditional rendering based on user roles

#### 2. Client Portal Access Control (HIGH PRIORITY)
- Client users can access all documents instead of only assigned matters
- No matter-based document filtering for clients
- Missing client-specific upload inbox

#### 3. Matter-Level Permissions (MEDIUM PRIORITY)
- No matter ownership/sharing system
- Legal professionals can access all firm documents instead of only their matters
- No granular document access control

#### 4. External Partner System (LOW PRIORITY)
- No time-boxed access implementation
- No cross-firm sharing with expiry
- Missing partner role restrictions

#### 5. Role Hierarchy (LOW PRIORITY)
- No implementation of role hierarchy levels
- No delegation of permissions

## Implementation Priority

### Phase 1: Frontend Role Guards (NEXT)
```typescript
// Required components:
<AdminOnly>          // super_admin, firm_admin only
<LegalStaffOnly>     // legal_manager, legal_professional only  
<RoleGuard roles={['super_admin']}>
<RequirePermission permission="user_management">
```

### Phase 2: Client Portal Security (CRITICAL)
- Implement matter-based document filtering
- Add client-specific document access
- Create upload inbox for clients

### Phase 3: Matter Ownership & Sharing
- Add matter ownership tracking
- Implement document-level permissions
- Add sharing with external partners

## Required Frontend Changes

### 1. AuthContext Updates
```typescript
// Add these methods to AuthContext:
const { 
  isAdmin,              // super_admin || firm_admin
  isSuperAdmin,         // super_admin only
  canManageUsers,       // super_admin || firm_admin  
  canAccessAdmin,       // super_admin || firm_admin
  canManageMatters,     // legal_manager || legal_professional
  isClient,             // client_user only
  isExternalPartner     // external_partner only
} = useAuth();
```

### 2. Navigation Guards
```typescript
// Hide admin menu from non-admins
{isAdmin() && <AdminMenuItem />}

// Hide matter management from clients
{canManageMatters() && <MatterMenuItem />}
```

### 3. Page-Level Protection
```typescript
// Protect admin routes
<Route path="/admin/*" element={
  <AdminOnly>
    <AdminLayout />
  </AdminOnly>
} />
```

## Database Schema Alignment

Current schema supports the role system correctly:
- `users.roles: string[]` - stores Keycloak role names
- `users.firm_id` - enforces firm isolation
- No additional role tables needed (simplified approach)

## Next Steps

1. **✅ DONE**: Reset to working authentication state
2. **🔄 IN PROGRESS**: Create this specification document
3. **📋 NEXT**: Implement frontend role guard components
4. **📋 NEXT**: Fix client portal access control
5. **📋 LATER**: Implement matter-level permissions

## Notes

- Keep the current simple role system (no complex RBAC database tables)
- Roles come from Keycloak JWT tokens only
- Focus on frontend guards and client security first
- Matter-level permissions can be added later without breaking changes
