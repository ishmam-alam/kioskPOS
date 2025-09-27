export class AppError extends Error {
    statusCode;
    message;
    details;
    constructor(statusCode, message, details) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.details = details;
        this.name = "AppError";
    }
}
export const errorHandler = (err, req, res, next) => {
    console.error("Error:", {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
    });
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            error: err.message,
            details: err.details
        });
    }
    // Handle Prisma errors
    if (err.name.includes("Prisma")) {
        return res.status(503).json({
            success: false,
            error: "Service temporarily unavailable - database error",
            details: process.env.NODE_ENV === "development" ? err.message : undefined
        });
    }
    // Handle JWT errors
    if (err.name === "JsonWebTokenError") {
        return res.status(401).json({
            success: false,
            error: "Invalid token"
        });
    }
    if (err.name === "TokenExpiredError") {
        return res.status(401).json({
            success: false,
            error: "Token expired"
        });
    }
    // Default error
    res.status(500).json({
        success: false,
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" ? err.message : undefined
    });
};
//# sourceMappingURL=errorHandler.js.map