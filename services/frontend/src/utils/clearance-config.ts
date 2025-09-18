// Role-based clearance level defaults and constraints

export interface ClearanceConfig {
  defaultLevel: number;
  minLevel: number;
  maxLevel: number;
  description: string;
}

export const ROLE_CLEARANCE_CONFIG: Record<string, ClearanceConfig> = {
  super_admin: {
    defaultLevel: 10,
    minLevel: 8,
    maxLevel: 10,
    description: 'System administrators with full access to all classified materials'
  },
  firm_admin: {
    defaultLevel: 8,
    minLevel: 6,
    maxLevel: 10,
    description: 'Firm administrators managing sensitive firm operations'
  },
  legal_manager: {
    defaultLevel: 7,
    minLevel: 5,
    maxLevel: 9,
    description: 'Legal managers overseeing confidential client matters'
  },
  legal_professional: {
    defaultLevel: 5,
    minLevel: 3,
    maxLevel: 8,
    description: 'Lawyers and legal professionals handling client cases'
  },
  paralegal: {
    defaultLevel: 4,
    minLevel: 2,
    maxLevel: 6,
    description: 'Paralegals supporting legal work with restricted access'
  },
  support_staff: {
    defaultLevel: 3,
    minLevel: 1,
    maxLevel: 5,
    description: 'Support staff with limited access to confidential materials'
  },
  client_user: {
    defaultLevel: 2,
    minLevel: 1,
    maxLevel: 4,
    description: 'Client users with access to their own matters only'
  }
};

export const DEFAULT_CLEARANCE_LEVEL = 5;
export const MAX_CLEARANCE_LEVEL = 10;
export const MIN_CLEARANCE_LEVEL = 1;

/**
 * Get the recommended clearance level for a set of roles
 */
export function getRecommendedClearanceLevel(roles: string[]): number {
  if (roles.length === 0) return DEFAULT_CLEARANCE_LEVEL;
  
  // Get the highest default level among all roles
  const maxDefault = Math.max(
    ...roles.map(role => ROLE_CLEARANCE_CONFIG[role]?.defaultLevel || DEFAULT_CLEARANCE_LEVEL)
  );
  
  return maxDefault;
}

/**
 * Get the valid clearance range for a set of roles
 */
export function getClearanceRange(roles: string[]): { min: number; max: number } {
  if (roles.length === 0) {
    return { min: MIN_CLEARANCE_LEVEL, max: MAX_CLEARANCE_LEVEL };
  }
  
  const configs = roles.map(role => ROLE_CLEARANCE_CONFIG[role]).filter(Boolean);
  
  if (configs.length === 0) {
    return { min: MIN_CLEARANCE_LEVEL, max: MAX_CLEARANCE_LEVEL };
  }
  
  const minLevel = Math.min(...configs.map(config => config.minLevel));
  const maxLevel = Math.max(...configs.map(config => config.maxLevel));
  
  return { min: minLevel, max: maxLevel };
}

/**
 * Validate if a clearance level is appropriate for given roles
 */
export function validateClearanceLevel(clearanceLevel: number, roles: string[]): {
  valid: boolean;
  message?: string;
  recommendation?: number;
} {
  const { min, max } = getClearanceRange(roles);
  const recommended = getRecommendedClearanceLevel(roles);
  
  if (clearanceLevel < min) {
    return {
      valid: false,
      message: `Clearance level ${clearanceLevel} is too low for the assigned roles. Minimum required: ${min}`,
      recommendation: recommended
    };
  }
  
  if (clearanceLevel > max) {
    return {
      valid: false,
      message: `Clearance level ${clearanceLevel} is too high for the assigned roles. Maximum allowed: ${max}`,
      recommendation: recommended
    };
  }
  
  return { valid: true };
}

/**
 * Get clearance level label with security classification
 */
export function getClearanceDescription(level: number): string {
  const descriptions = {
    1: 'Public - No restrictions, general access',
    2: 'Internal - Internal company use only',
    3: 'Confidential - Restricted to authorized personnel',
    4: 'Restricted - Limited access, sensitive information',
    5: 'Secret - Classified information requiring clearance',
    6: 'Top Secret - Highly classified, critical information',
    7: 'Compartmented - Special access required',
    8: 'Special Access - Ultra-sensitive, need-to-know basis',
    9: 'Critical - Mission-critical, highest security',
    10: 'Ultra Classified - Maximum security classification'
  };
  
  return descriptions[level as keyof typeof descriptions] || `Level ${level}`;
}