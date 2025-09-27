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

class Logger {
  private log(level: string, message: string, meta?: any) {
    const timestamp = new Date().toISOString();
    const logEntry: LogEntry = {
      timestamp,
      level,
      message,
      ...meta
    };

    // Console output with colors
    const color = this.getColor(level);
    console.log(
      `\x1b[${color}m[${timestamp}] ${level.toUpperCase()}: ${message}\x1b[0m`,
      meta ? JSON.stringify(meta, null, 2) : ''
    );

    // TODO: Add file logging, database logging, or external service integration here
  }

  private getColor(level: string): string {
    const colors: { [key: string]: string } = {
      error: '31', // red
      warn: '33',  // yellow
      info: '32',  // green
      debug: '36', // cyan
      http: '35'   // magenta
    };
    return colors[level] || '37'; // default white
  }

  error(message: string, error?: any, meta?: any) {
    this.log('error', message, { error, ...meta });
  }

  warn(message: string, meta?: any) {
    this.log('warn', message, meta);
  }

  info(message: string, meta?: any) {
    this.log('info', message, meta);
  }

  debug(message: string, meta?: any) {
    this.log('debug', message, meta);
  }

  http(message: string, meta?: any) {
    this.log('http', message, meta);
  }
}

export const logger = new Logger();

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logMeta = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: duration,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      userId: (req as any).user?.userId
    };

    if (res.statusCode >= 500) {
      logger.error('Server error', undefined, logMeta);
    } else if (res.statusCode >= 400) {
      logger.warn('Client error', logMeta);
    } else {
      logger.info('Request completed', logMeta);
    }
  });

  next();
};

// Error logging middleware
export const errorLogger = (error: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error', error, {
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.userId
  });
  
  next(error);
};

// Performance monitoring middleware
export const performanceMonitor = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    if (duration > 1000) { // Log slow requests (>1 second)
      logger.warn('Slow request', {
        method: req.method,
        url: req.url,
        duration,
        threshold: 1000
      });
    }
    
    if (duration > 5000) { // Log very slow requests (>5 seconds)
      logger.error('Very slow request', undefined, {
        method: req.method,
        url: req.url,
        duration,
        threshold: 5000
      });
    }
  });
  
  next();
};
