/**
 * User role definitions for the POS system
 * 
 * Roles are hierarchical with higher numbers having more privileges:
 * - VISITOR (0): Guest access, minimal permissions
 * - OWNER (1): Business owner, full access except system admin functions
 * - MANAGER (2): Store manager, can manage employees and operations
 * - EMPLOYEE (3): Regular employee, can process sales
 * - CONTROLLER (4): Financial controller, audit and reporting access
 * - ADMIN (419): System administrator, full system access (419 = HTTP "I'm a teapot" - unique identifier)
 */
export enum Role {
  VISITOR = 0,      // Guest/minimal access
  OWNER = 1,        // Business owner
  MANAGER = 2,      // Store manager
  EMPLOYEE = 3,     // Regular employee
  CONTROLLER = 4,   // Financial controller
  ADMIN = 419,      // System administrator (unique high number)
}

/**
 * Helper function to get role name as string
 */
export function getRoleName(role: Role): string {
  return Role[role] || 'UNKNOWN';
}

/**
 * Helper function to check if a role has admin privileges
 */
export function isAdminRole(role: Role): boolean {
  return role === Role.ADMIN;
}

/**
 * Helper function to check if a role can manage users
 */
export function canManageUsers(role: Role): boolean {
  return [Role.ADMIN, Role.OWNER, Role.MANAGER].includes(role);
}
