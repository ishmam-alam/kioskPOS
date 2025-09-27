import { Router } from "express";
import type { Request, Response } from "express";
import { PrismaClient, type Register } from "@prisma/client";
import type { ApiResponse } from "../types/ApiResponse.js";
import { attachUser } from "../middleware/auth.js";
import { Role } from "../middleware/roles.js";
import { requireRoles } from "../middleware/rbac.js";

const prisma = new PrismaClient();
const router = Router();

// Type definitions for register requests and responses
type CreateRegisterRequest = Pick<Register, 'register_number' | 'name' | 'location'>;
type UpdateRegisterRequest = Partial<Pick<Register, 'register_number' | 'name' | 'location'>>;

// ----------------------------
// GET all registers (Admin only)
// ----------------------------
router.get(
  "/",
  attachUser,
  requireRoles([Role.ADMIN]),
  async (req: Request, res: Response<ApiResponse<Register[]>>) => {
    try {
      const registers = await prisma.register.findMany({
        orderBy: { created_at: "desc" }
      });
      res.json({ success: true, data: registers });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ success: false, error: "Error fetching registers", details: err.message });
    }
  }
);

// ----------------------------
// GET register by ID (Admin only)
// ----------------------------
router.get("/:id", attachUser, requireRoles([Role.ADMIN]), async (req: Request<{ id: string }>, res: Response<ApiResponse<Register>>) => {
  const { id } = req.params;

  try {
    const register = await prisma.register.findUnique({ where: { id: Number(id) } });
    if (!register) {
      return res.status(404).json({ success: false, error: `Register with id "${id}" not found` });
    }

    res.json({ success: true, data: register });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, error: "Error fetching register", details: err.message });
  }
});

// ----------------------------
// CREATE register (Admin only)
// ----------------------------
router.post(
  "/",
  attachUser,
  requireRoles([Role.ADMIN]),
  async (req: Request<{}, {}, CreateRegisterRequest>, res: Response<ApiResponse<Register>>) => {
    const { register_number, name, location } = req.body;

    // Validate input
    const errors: string[] = [];
    
    if (register_number === undefined) {
      errors.push("register_number is required");
    } else if (typeof register_number !== 'number') {
      errors.push("register_number must be a number");
    }
    
    if (name !== undefined && typeof name !== 'string') {
      errors.push("name must be a string");
    } else if (name && name.length > 100) {
      errors.push("name must be less than 100 characters");
    }
    
    if (location !== undefined && typeof location !== 'string') {
      errors.push("location must be a string");
    } else if (location && location.length > 100) {
      errors.push("location must be less than 100 characters");
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, error: "Validation failed", details: errors });
    }

    try {
      const newRegister = await prisma.register.create({
        data: { 
          register_number,
          name: name || null,
          location: location || null
        },
      });
      res.status(201).json({ success: true, data: newRegister });
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.code === "P2002" ? `Register with register_number "${register_number}" already exists` : "Error creating register";
      res.status(500).json({ success: false, error: errorMsg, details: err.message });
    }
  }
);

// ----------------------------
// PATCH register (Admin only)
// ----------------------------
router.patch(
  "/:id",
  attachUser,
  requireRoles([Role.ADMIN]),
  async (req: Request<{ id: string }, {}, UpdateRegisterRequest>, res: Response<ApiResponse<Register>>) => {
    const { id } = req.params;
    const { register_number, name, location } = req.body;

    // Validate input
    const errors: string[] = [];
    
    if (register_number !== undefined && typeof register_number !== 'number') {
      errors.push("register_number must be a number");
    }
    
    if (name !== undefined && typeof name !== 'string') {
      errors.push("name must be a string");
    } else if (name && name.length > 100) {
      errors.push("name must be less than 100 characters");
    }
    
    if (location !== undefined && typeof location !== 'string') {
      errors.push("location must be a string");
    } else if (location && location.length > 100) {
      errors.push("location must be less than 100 characters");
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, error: "Validation failed", details: errors });
    }

    try {
      // Check if register exists
      const existingRegister = await prisma.register.findUnique({ where: { id: Number(id) } });
      if (!existingRegister) {
        return res.status(404).json({ success: false, error: `Register with id "${id}" not found` });
      }

      // Build update data object dynamically
      const updateData: any = {};
      if (register_number !== undefined) updateData.register_number = register_number;
      if (name !== undefined) updateData.name = name || null;
      if (location !== undefined) updateData.location = location || null;

      const updatedRegister = await prisma.register.update({
        where: { id: Number(id) },
        data: updateData,
      });
      res.json({ success: true, data: updatedRegister });
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.code === "P2002" ? `Register with this register_number already exists` : "Error updating register";
      res.status(500).json({ success: false, error: errorMsg, details: err.message });
    }
  }
);

// ----------------------------
// DELETE register (Admin only)
// ----------------------------
router.delete(
  "/:id",
  attachUser,
  requireRoles([Role.ADMIN]),
  async (req: Request<{ id: string }>, res: Response<ApiResponse<null>>) => {
    const { id } = req.params;
    
    try {
      // Check if register exists
      const existingRegister = await prisma.register.findUnique({ where: { id: Number(id) } });
      if (!existingRegister) {
        return res.status(404).json({ success: false, error: `Register with id "${id}" not found` });
      }

      // Check if register is used in any sales
      const salesCount = await prisma.sale.count({
        where: { register_id: Number(id) }
      });

      if (salesCount > 0) {
        return res.status(400).json({ 
          success: false, 
          error: "Cannot delete register with associated sales",
          details: `Register has ${salesCount} associated sales`
        });
      }

      // Check if register is used in any cancellations
      const cancellationsCount = await prisma.cancellation.count({
        where: { register_id: Number(id) }
      });

      if (cancellationsCount > 0) {
        return res.status(400).json({ 
          success: false, 
          error: "Cannot delete register with associated cancellations",
          details: `Register has ${cancellationsCount} associated cancellations`
        });
      }

      // If no associated records, delete the register
      await prisma.register.delete({ where: { id: Number(id) } });
      res.json({ success: true, data: null });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ success: false, error: "Error deleting register", details: err.message });
    }
  }
);

export default router;
