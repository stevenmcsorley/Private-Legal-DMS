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
    some share in input.resource.shared_with
    share.firm_id == input.user.attrs.firm_id
    share.expires_at > time.now_ns()
}

# Document access rules
allow if {
    input.resource.type == "document"
    input.action in ["read", "download"]
    
    # Must have firm access or cross-firm access
    firm_access_allowed or cross_firm_access_allowed
    
    # Security clearance check
    input.user.attrs.clearance_level >= input.resource.security_class
    
    # Role-based permissions
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
    input.action in ["create", "update", "delete"]
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

# Matter sharing (cross-firm collaboration)
allow if {
    input.resource.type == "matter"
    input.action == "share"
    firm_access_allowed
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

# Generate decision with reasoning
decision := {
    "allow": allow,
    "reason": reason
}

reason := "access granted" if allow

reason := "insufficient clearance" if {
    not allow
    input.resource.security_class > input.user.attrs.clearance_level
}

reason := "firm access denied" if {
    not allow
    not firm_access_allowed
    not cross_firm_access_allowed
}

reason := "role insufficient" if {
    not allow
    not reason == "insufficient clearance"
    not reason == "firm access denied"
}

reason := "legal hold prevents action" if {
    not allow
    input.resource.legal_hold == true
    input.action == "delete"
}

reason := "default deny" if {
    not allow
    not reason
}