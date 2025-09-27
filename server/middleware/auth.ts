import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { Role } from "./roles.js";

const JWT_SECRET = process.env.JWT_SECRET || (() => {
  throw new Error("JWT_SECRET environment variable is required");
})();

declare global {
  namespace Express {
    interface Request {
      user?: { userId: number; role: Role };
    }
  }
}

export function attachUser(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    delete req.user;
    return next();
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    delete req.user;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & {
      userId?: number;
      role?: number;
    };

    if (typeof decoded.userId === "number" && typeof decoded.role === "number") {
      req.user = { userId: decoded.userId, role: decoded.role as Role };
    } else {
      delete req.user;
    }

    next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    delete req.user;
    next();
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ success: false, error: "Authentication required" });
  }
  next();
}

export function generateToken(userId: number, role: Role) {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: "8h" });
}
