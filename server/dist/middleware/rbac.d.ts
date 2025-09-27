import type { Request, Response, NextFunction } from "express";
import { Role } from "./roles.js";
/**
 * Middleware: allow only admin
 */
export declare function adminOnly(req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
/**
 * Middleware: require a specific role
 */
export declare function requireRole(requiredRole: Role): (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
/**
 * Middleware: allow multiple roles
 */
export declare function requireRoles(allowedRoles: Role[]): (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=rbac.d.ts.map