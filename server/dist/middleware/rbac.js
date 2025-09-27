import { Role } from "./roles.js"; // your enum
/**
 * Middleware: allow only admin
 */
export function adminOnly(req, res, next) {
    if (!req.user || req.user.role !== Role.ADMIN) {
        return res.status(403).json({ success: false, error: "Admin privileges required" });
    }
    next();
}
/**
 * Middleware: require a specific role
 */
export function requireRole(requiredRole) {
    return (req, res, next) => {
        if (!req.user || req.user.role !== requiredRole) {
            return res.status(403).json({ success: false, error: "Insufficient privileges" });
        }
        next();
    };
}
/**
 * Middleware: allow multiple roles
 */
export function requireRoles(allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ success: false, error: "Insufficient privileges" });
        }
        next();
    };
}
//# sourceMappingURL=rbac.js.map