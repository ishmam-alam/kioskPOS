import { Role } from "../middleware/roles.js";

declare global {
  namespace Express {
    interface Request {
      /**
       * Populated by attachUser middleware
       * - undefined if not authenticated
       */
      user?: {
        userId: number;
        role: Role;
      };
    }
  }
}

export {}; // make it a module
