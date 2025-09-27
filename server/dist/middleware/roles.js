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
export var Role;
(function (Role) {
    Role[Role["VISITOR"] = 0] = "VISITOR";
    Role[Role["OWNER"] = 1] = "OWNER";
    Role[Role["MANAGER"] = 2] = "MANAGER";
    Role[Role["EMPLOYEE"] = 3] = "EMPLOYEE";
    Role[Role["CONTROLLER"] = 4] = "CONTROLLER";
    Role[Role["ADMIN"] = 419] = "ADMIN";
})(Role || (Role = {}));
/**
 * Helper function to get role name as string
 */
export function getRoleName(role) {
    return Role[role] || 'UNKNOWN';
}
/**
 * Helper function to check if a role has admin privileges
 */
export function isAdminRole(role) {
    return role === Role.ADMIN;
}
/**
 * Helper function to check if a role can manage users
 */
export function canManageUsers(role) {
    return [Role.ADMIN, Role.OWNER, Role.MANAGER].includes(role);
}
//# sourceMappingURL=roles.js.map