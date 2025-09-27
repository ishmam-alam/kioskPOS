import type { Request, Response, NextFunction } from "express";
import { Role } from "./roles.js";
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: number;
                role: Role;
            };
        }
    }
}
export declare function attachUser(req: Request, _res: Response, next: NextFunction): void;
export declare function requireAuth(req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
export declare function generateToken(userId: number, role: Role): string;
//# sourceMappingURL=auth.d.ts.map