import type { Request, Response, NextFunction } from "express";
export interface LogEntry {
    timestamp: string;
    level: string;
    message: string;
    method: string;
    url: string;
    statusCode?: number;
    responseTime?: number;
    ip?: string;
    userAgent?: string;
    userId?: number;
    error?: any;
}
declare class Logger {
    private log;
    private getColor;
    error(message: string, error?: any, meta?: any): void;
    warn(message: string, meta?: any): void;
    info(message: string, meta?: any): void;
    debug(message: string, meta?: any): void;
    http(message: string, meta?: any): void;
}
export declare const logger: Logger;
export declare const requestLogger: (req: Request, res: Response, next: NextFunction) => void;
export declare const errorLogger: (error: Error, req: Request, res: Response, next: NextFunction) => void;
export declare const performanceMonitor: (req: Request, res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=logger.d.ts.map