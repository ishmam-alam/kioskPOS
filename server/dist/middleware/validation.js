import { z } from "zod";
import { AppError } from "./errorHandler.js";
// User validation schemas
export const createUserSchema = z.object({
    user_id: z.number().int().positive().min(1000).max(99999999),
    pin: z.number().int().positive().min(1000).max(999999),
    name: z.string().max(100).optional(),
    role: z.number().int().min(0).max(419),
    active: z.boolean().optional().default(true)
});
export const updateUserSchema = z.object({
    pin: z.number().int().positive().min(1000).max(999999).optional(),
    name: z.string().max(100).optional(),
    role: z.number().int().min(0).max(419).optional(),
    active: z.boolean().optional()
});
export const loginSchema = z.object({
    user_id: z.number().int().positive(),
    pin: z.number().int().positive()
});
// Product validation schemas
export const createProductSchema = z.object({
    sku: z.string().max(50).optional(),
    name: z.string().min(1).max(200),
    price_cents: z.number().int().nonnegative(),
    stock_qty: z.number().int().nonnegative().optional().default(0),
    tax_rate: z.number().optional().nullable(),
    active: z.boolean().optional().default(true)
});
export const updateProductSchema = z.object({
    sku: z.string().max(50).optional(),
    name: z.string().min(1).max(200).optional(),
    price_cents: z.number().int().nonnegative().optional(),
    stock_qty: z.number().int().nonnegative().optional(),
    tax_rate: z.number().optional().nullable(),
    active: z.boolean().optional()
});
export const validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            const result = schema.safeParse(req.body);
            if (!result.success) {
                const errors = result.error.issues.map(issue => ({
                    field: issue.path.join('.'),
                    message: issue.message
                }));
                throw new AppError(400, "Validation failed", errors);
            }
            req.body = result.data;
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
export const validateParams = (schema, paramName = "id") => {
    return (req, res, next) => {
        try {
            const result = schema.safeParse(req.params[paramName]);
            if (!result.success) {
                throw new AppError(400, `Invalid ${paramName} parameter`);
            }
            // Store the validated data in a custom property
            req.validatedParams = req.validatedParams || {};
            req.validatedParams[paramName] = result.data;
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
// Common validation schemas
export const idParamSchema = z.string().regex(/^\d+$/).transform((val) => Number(val));
export const booleanQuerySchema = z.enum(['true', 'false']).transform((val) => val === 'true');
//# sourceMappingURL=validation.js.map