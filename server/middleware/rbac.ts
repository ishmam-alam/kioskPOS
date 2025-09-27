import type { Request, Response, NextFunction } from "express";
import { Role } from "./roles.js"; // your enum

/**
 * Middleware: allow only admin
 */
export function adminOnly(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== Role.ADMIN) {
    return res.status(403).json({ success: false, error: "Admin privileges required" });
  }
  next();
}

/**
 * Middleware: require a specific role
 */
export function requireRole(requiredRole: Role) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== requiredRole) {
      return res.status(403).json({ success: false, error: "Insufficient privileges" });
    }
    next();
  };
}

/**
 * Middleware: allow multiple roles
 */
export function requireRoles(allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: "Insufficient privileges" });
    }
    next();
  };
}
