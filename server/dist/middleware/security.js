import rateLimit from "express-rate-limit";
import helmet from "helmet";
// Security headers middleware
export const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
        },
    },
    crossOriginEmbedderPolicy: false,
});
// Rate limiting middleware
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        error: "Too many requests from this IP, please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// Login rate limiting (more strict)
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 login attempts per windowMs
    message: {
        success: false,
        error: "Too many login attempts from this IP, please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// CORS configuration
export const corsOptions = {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    optionsSuccessStatus: 200
};
// Input sanitization middleware
export const sanitizeInput = (req, res, next) => {
    const sanitize = (obj) => {
        if (typeof obj === 'string') {
            // Basic XSS protection - remove script tags and dangerous attributes
            return obj
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/on\w+="[^"]*"/g, '')
                .replace(/on\w+='[^']*'/g, '')
                .replace(/javascript:/gi, '')
                .replace(/data:/gi, '');
        }
        if (Array.isArray(obj)) {
            return obj.map(sanitize);
        }
        if (obj && typeof obj === 'object') {
            const sanitized = {};
            for (const key in obj) {
                sanitized[key] = sanitize(obj[key]);
            }
            return sanitized;
        }
        return obj;
    };
    if (req.body) {
        req.body = sanitize(req.body);
    }
    if (req.query) {
        req.query = sanitize(req.query);
    }
    next();
};
// SQL injection protection middleware
export const sqlInjectionProtection = (req, res, next) => {
    const checkForSqlInjection = (value) => {
        if (typeof value !== 'string')
            return false;
        const sqlKeywords = [
            'select', 'insert', 'update', 'delete', 'drop', 'truncate',
            'union', 'join', 'exec', 'execute', 'script', 'alert'
        ];
        const dangerousPatterns = [
            /';/,
            /"--/,
            /\/\*/,
            /\*\//,
            /union.*select/i,
            /insert.*into/i,
            /drop.*table/i,
            /exec\(/i,
            /xp_cmdshell/i
        ];
        const lowerValue = value.toLowerCase();
        // Check for SQL keywords in suspicious contexts
        if (sqlKeywords.some(keyword => lowerValue.includes(keyword) &&
            (lowerValue.includes('--') || lowerValue.includes('/*') || lowerValue.includes('*/')))) {
            return true;
        }
        // Check for dangerous patterns
        return dangerousPatterns.some(pattern => pattern.test(value));
    };
    const checkObject = (obj) => {
        if (typeof obj === 'string') {
            return checkForSqlInjection(obj);
        }
        if (Array.isArray(obj)) {
            return obj.some(checkObject);
        }
        if (obj && typeof obj === 'object') {
            return Object.values(obj).some(checkObject);
        }
        return false;
    };
    if (checkObject(req.body) || checkObject(req.query) || checkObject(req.params)) {
        return res.status(400).json({
            success: false,
            error: "Invalid input detected"
        });
    }
    next();
};
//# sourceMappingURL=security.js.map