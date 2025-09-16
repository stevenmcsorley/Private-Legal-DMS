package dms.authz

# Import future keywords for cleaner syntax
import rego.v1

# Default deny
default allow := false

# Allow super admins everything
allow if {
    "super_admin" in input.user.roles
}

# Firm isolation - users can only access resources in their firm
firm_access_allowed if {
    input.user.attrs.firm_id == input.resource.firm_id
}

# Cross-firm access via matter shares
cross_firm_access_allowed if {
    input.resource.type == "document"
    some share in input.resource.matter_shares
    share.shared_with_firm_id == input.user.attrs.firm_id
    share.status == "accepted"
    _share_not_expired(share)
}

cross_firm_access_allowed if {
    input.resource.type == "matter"
    some share in input.resource.shares
    share.shared_with_firm_id == input.user.attrs.firm_id
    share.status == "accepted"
    _share_not_expired(share)
}

# Helper function to check if share is not expired
_share_not_expired(share) if {
    not share.expires_at
}

_share_not_expired(share) if {
    share.expires_at
    time.parse_rfc3339_ns(share.expires_at) > time.now_ns()
}

# Document access rules (firm access)
allow if {
    input.resource.type == "document"
    input.action in ["read", "download"]
    firm_access_allowed
    input.user.attrs.clearance_level >= input.resource.security_class
    input.user.roles[_] in ["legal_professional", "legal_manager", "firm_admin"]
}

# Document access rules (cross-firm access)
allow if {
    input.resource.type == "document"
    input.action in ["read", "download"]
    cross_firm_access_allowed
    input.user.attrs.clearance_level >= input.resource.security_class
    input.user.roles[_] in ["legal_professional", "legal_manager", "firm_admin"]
}

# Client users can only read their assigned documents
allow if {
    input.resource.type == "document"
    input.action in ["read", "download"]
    "client_user" in input.user.roles
    
    # Client can access documents in matters they're assigned to
    input.user.id in input.resource.client_ids
}

# Document upload permissions
allow if {
    input.resource.type == "document"
    input.action == "upload"
    firm_access_allowed
    input.user.roles[_] in ["legal_professional", "legal_manager", "firm_admin", "support_staff"]
}

# Client upload to inbox
allow if {
    input.resource.type == "document"
    input.action == "upload"
    "client_user" in input.user.roles
    input.resource.is_client_upload == true
    input.user.id in input.resource.client_ids
}

# Document deletion - blocked if legal hold
allow if {
    input.resource.type == "document"
    input.action == "delete"
    firm_access_allowed
    input.resource.legal_hold == false
    input.user.roles[_] in ["legal_professional", "legal_manager", "firm_admin"]
}

# Legal hold management
allow if {
    input.resource.type == "document"
    input.action in ["hold", "release_hold"]
    firm_access_allowed
    input.user.roles[_] in ["legal_professional", "legal_manager", "firm_admin"]
}

# Matter access
allow if {
    input.resource.type == "matter"
    input.action in ["read", "list"]
    firm_access_allowed
    input.user.roles[_] in ["legal_professional", "legal_manager", "firm_admin"]
}

# Matter management
allow if {
    input.resource.type == "matter"
    input.action in ["create", "update", "delete", "write"]
    firm_access_allowed
    input.user.roles[_] in ["legal_professional", "legal_manager", "firm_admin"]
}

# Client access to assigned matters only
allow if {
    input.resource.type == "matter"
    input.action in ["read"]
    "client_user" in input.user.roles
    input.user.id in input.resource.client_ids
}

# Client management
allow if {
    input.resource.type == "client"
    input.action in ["create", "update", "read", "list"]
    firm_access_allowed
    input.user.roles[_] in ["legal_professional", "legal_manager", "firm_admin"]
}

# User management (firm admins only)
allow if {
    input.resource.type == "user"
    input.action in ["create", "update", "read", "list"]
    firm_access_allowed
    "firm_admin" in input.user.roles
}

# Super admin user management
allow if {
    input.resource.type == "user"
    input.action in ["create", "update", "read", "list", "delete"]
    "super_admin" in input.user.roles
}

# Firm management (super admin only)
allow if {
    input.resource.type == "firm"
    "super_admin" in input.user.roles
}

# Search access - same as document read access
allow if {
    input.resource.type == "search"
    input.action == "query"
    firm_access_allowed
    input.user.roles[_] in ["legal_professional", "legal_manager", "firm_admin", "client_user"]
}

# Audit log access
allow if {
    input.resource.type == "audit"
    input.action in ["read", "export"]
    firm_access_allowed
    input.user.roles[_] in ["legal_professional", "legal_manager", "firm_admin"]
}

# Super admin audit access across all firms
allow if {
    input.resource.type == "audit"
    input.action in ["read", "export"]
    "super_admin" in input.user.roles
}

# Matter sharing management
# Create new matter shares (only by owning firm)
allow if {
    input.resource.type == "matter_share"
    input.action == "create"
    input.resource.shared_by_firm_id == input.user.attrs.firm_id
    input.user.roles[_] in ["legal_professional", "legal_manager", "firm_admin"]
}

# View matter shares (either sharing or receiving firm)
allow if {
    input.resource.type == "matter_share"
    input.action in ["read", "list"]
    _has_share_access
    input.user.roles[_] in ["legal_professional", "legal_manager", "firm_admin", "support_staff"]
}

# Update matter shares (both firms can update - sharing firm for permissions, receiving firm for status)
allow if {
    input.resource.type == "matter_share" 
    input.action == "update"
    _has_share_access
    input.user.roles[_] in ["legal_professional", "legal_manager", "firm_admin"]
}

# Delete matter shares (only sharing firm)
allow if {
    input.resource.type == "matter_share"
    input.action == "delete"
    input.resource.shared_by_firm_id == input.user.attrs.firm_id
    input.user.roles[_] in ["legal_manager", "firm_admin"]
}

# Accept/decline share invitations (only receiving firm)
allow if {
    input.resource.type == "matter_share"
    input.action in ["accept", "decline"]
    input.resource.shared_with_firm_id == input.user.attrs.firm_id
    input.user.roles[_] in ["legal_professional", "legal_manager", "firm_admin"]
}

# Revoke shares (only sharing firm)
allow if {
    input.resource.type == "matter_share"
    input.action == "revoke"
    input.resource.shared_by_firm_id == input.user.attrs.firm_id
    input.user.roles[_] in ["legal_professional", "legal_manager", "firm_admin"]
}

# Helper function for share access
_has_share_access if {
    input.resource.shared_by_firm_id == input.user.attrs.firm_id
}

_has_share_access if {
    input.resource.shared_with_firm_id == input.user.attrs.firm_id
}

# Cross-firm matter access (via active shares)
allow if {
    input.resource.type == "matter"
    input.action in ["read", "list"]
    cross_firm_access_allowed
    input.user.roles[_] in ["legal_professional", "legal_manager", "firm_admin"]
}

# System administration
allow if {
    input.resource.type in ["system", "retention_class", "legal_hold_policy"]
    "super_admin" in input.user.roles
}

# Firm-level administration
allow if {
    input.resource.type in ["retention_class", "team", "acl"]
    input.action in ["create", "update", "read", "list", "delete"]
    firm_access_allowed
    "firm_admin" in input.user.roles
}

# Generate decision (simple)
decision := {"allow": allow, "reason": allow_reason}

allow_reason := "access granted" if allow
allow_reason := "denied" if {
  not allow
}
