import type { Request, Response, NextFunction } from "express";
export declare const securityHeaders: (req: import("http").IncomingMessage, res: import("http").ServerResponse, next: (err?: unknown) => void) => void;
export declare const apiLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const loginLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const corsOptions: {
    origin: string;
    credentials: boolean;
    optionsSuccessStatus: number;
};
export declare const sanitizeInput: (req: Request, res: Response, next: NextFunction) => void;
export declare const sqlInjectionProtection: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=security.d.ts.map