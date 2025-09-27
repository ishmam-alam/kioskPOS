import type { Request, Response, NextFunction } from "express";
import type { ApiResponse } from "../types/ApiResponse.js";
export declare class AppError extends Error {
    statusCode: number;
    message: string;
    details?: any | undefined;
    constructor(statusCode: number, message: string, details?: any | undefined);
}
export declare const errorHandler: (err: Error | AppError, req: Request, res: Response<ApiResponse<null>>, next: NextFunction) => Response<ApiResponse<null>, Record<string, any>> | undefined;
//# sourceMappingURL=errorHandler.d.ts.map