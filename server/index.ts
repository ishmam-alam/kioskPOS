import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// Import middleware
import { securityHeaders, apiLimiter, loginLimiter, sanitizeInput, sqlInjectionProtection } from "./middleware/security.js";
import { requestLogger, errorLogger, performanceMonitor, logger } from "./middleware/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";

// Import routes
import usersRouter from "./routes/users.js"; // .js extension required for ESM
import productsRouter from "./routes/products.js"; // .js extension required for ESM
import registersRouter from "./routes/registers.js"; // .js extension required for ESM
import salesRouter from "./routes/sales.js"; // .js extension required for ESM
import saleItemsRouter from "./routes/saleItems.js"; // .js extension required for ESM
import cancellationsRouter from "./routes/cancellations.js"; // .js extension required for ESM
import stockInsRouter from "./routes/stockIns.js"; // .js extension required for ESM
import turnOverRouter from "./routes/turnOver.js"; // .js extension required for ESM
import tseDevicesRouter from "./routes/tseDevices.js"; // .js extension required for ESM
import registerReportingRouter from "./routes/registerReporting.js"; // .js extension required for ESM
import dsfinvKExportsRouter from "./routes/dsfinvKExports.js"; // .js extension required for ESM
import auditLogsRouter from "./routes/auditLogs.js"; // .js extension required for ESM
import inventoryMovementsRouter from "./routes/inventoryMovements.js"; // .js extension required for ESM
import dailySalesSummaryRouter from "./routes/dailySalesSummary.js"; // .js extension required for ESM

// Import database
import prisma from "./lib/database.js";

dotenv.config();

const app = express();

// Security middleware (first in chain)
app.use(securityHeaders);
app.use(sanitizeInput);
app.use(sqlInjectionProtection);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3001",
  credentials: true,
  optionsSuccessStatus: 200
}));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging and performance monitoring
app.use(requestLogger);
app.use(performanceMonitor);

// Rate limiting
app.use("/api/", apiLimiter);
app.use("/api/users/login", loginLimiter);

// Mount routes
app.use("/api/users", usersRouter);
app.use("/api/products", productsRouter);
app.use("/api/registers", registersRouter);
app.use("/api/sales", salesRouter);
app.use("/api/sale-items", saleItemsRouter);
app.use("/api/cancellations", cancellationsRouter);
app.use("/api/stock-ins", stockInsRouter);
app.use("/api/turnover", turnOverRouter);
app.use("/api/tse-devices", tseDevicesRouter);
app.use("/api/register-reporting", registerReportingRouter);
app.use("/api/dsfinvk-exports", dsfinvKExportsRouter);
app.use("/api/audit-logs", auditLogsRouter);
app.use("/api/inventory-movements", inventoryMovementsRouter);
app.use("/api/daily-sales-summary", dailySalesSummaryRouter);

// Health check endpoint
app.get("/health", async (_req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: "connected"
    });
  } catch (error) {
    console.error("Database health check failed:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(503).json({
      status: "Service Unavailable",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: "disconnected",
      error: process.env.NODE_ENV === "development" ? errorMessage : "Database connection failed"
    });
  }
});

// Welcome endpoint
app.get("/welcome", (req, res) => {
  logger.info("Welcome endpoint accessed", {
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  });

  res.json({
    message: "Welcome to the Kistablasta Kiosk API!",
    timestamp: new Date().toISOString()
  });
});

// Test root route
app.get("/", (_req, res) => {
  res.json({ message: "POS API running" });
});



// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ 
    success: false, 
    error: `Route ${req.originalUrl} not found` 
  });
});

// Error handling middleware (must be last)
app.use(errorLogger);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
});
