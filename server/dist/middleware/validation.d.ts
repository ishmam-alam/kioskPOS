import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
export declare const createUserSchema: z.ZodObject<{
    user_id: z.ZodNumber;
    pin: z.ZodNumber;
    name: z.ZodOptional<z.ZodString>;
    role: z.ZodNumber;
    active: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
export declare const updateUserSchema: z.ZodObject<{
    pin: z.ZodOptional<z.ZodNumber>;
    name: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodNumber>;
    active: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const loginSchema: z.ZodObject<{
    user_id: z.ZodNumber;
    pin: z.ZodNumber;
}, z.core.$strip>;
export declare const createProductSchema: z.ZodObject<{
    sku: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    price_cents: z.ZodNumber;
    stock_qty: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    tax_rate: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    active: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
export declare const updateProductSchema: z.ZodObject<{
    sku: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    price_cents: z.ZodOptional<z.ZodNumber>;
    stock_qty: z.ZodOptional<z.ZodNumber>;
    tax_rate: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    active: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const validateRequest: <T extends z.ZodSchema>(schema: T) => (req: Request, res: Response, next: NextFunction) => void;
export declare const validateParams: <T extends z.ZodSchema>(schema: T, paramName?: string) => (req: Request, res: Response, next: NextFunction) => void;
export declare const idParamSchema: z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>;
export declare const booleanQuerySchema: z.ZodPipe<z.ZodEnum<{
    true: "true";
    false: "false";
}>, z.ZodTransform<boolean, "true" | "false">>;
//# sourceMappingURL=validation.d.ts.map