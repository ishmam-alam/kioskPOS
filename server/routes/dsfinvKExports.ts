import { Router } from "express";
import type { Request, Response } from "express";
import { PrismaClient, type DSFinvKExport } from "@prisma/client";
import type { ApiResponse } from "../types/ApiResponse.js";
import { attachUser } from "../middleware/auth.js";
import { Role } from "../middleware/roles.js";
import { requireRoles } from "../middleware/rbac.js";

const prisma = new PrismaClient();
const router = Router();

// Type definitions for DSFinvK export requests and responses
type CreateDSFinvKExportRequest = Omit<DSFinvKExport, 'id' | 'created_at'>;
type UpdateDSFinvKExportRequest = Partial<Pick<DSFinvKExport, 'period_start' | 'period_end' | 'file_path'>>;

// ----------------------------
// GET all DSFinvK exports (Admin only)
// ----------------------------
router.get(
  "/",
  attachUser,
  requireRoles([Role.ADMIN]),
  async (req: Request, res: Response<ApiResponse<DSFinvKExport[]>>) => {
    try {
      const dsfinvKExports = await prisma.dSFinvKExport.findMany({
        orderBy: { created_at: "desc" }
      });
      res.json({ success: true, data: dsfinvKExports });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ success: false, error: "Error fetching DSFinvK exports", details: err.message });
    }
  }
);

// ----------------------------
// GET DSFinvK export by ID (Admin only)
// ----------------------------
router.get("/:id", attachUser, requireRoles([Role.ADMIN]), async (req: Request<{ id: string }>, res: Response<ApiResponse<DSFinvKExport>>) => {
  const { id } = req.params;

  try {
    const dsfinvKExport = await prisma.dSFinvKExport.findUnique({ where: { id: Number(id) } });
    if (!dsfinvKExport) {
      return res.status(404).json({ success: false, error: `DSFinvK export with id "${id}" not found` });
    }

    res.json({ success: true, data: dsfinvKExport });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, error: "Error fetching DSFinvK export", details: err.message });
  }
});

// ----------------------------
// CREATE DSFinvK export (Admin only)
// ----------------------------
router.post(
  "/",
  attachUser,
  requireRoles([Role.ADMIN]),
  async (req: Request<{}, {}, CreateDSFinvKExportRequest>, res: Response<ApiResponse<DSFinvKExport>>) => {
    const { period_start, period_end, file_path } = req.body;

    // Validate input
    const errors: string[] = [];
    
    if (period_start !== undefined && !(period_start instanceof Date) && typeof period_start !== 'string') {
      errors.push("period_start must be a valid date");
    }
    
    if (period_end !== undefined && !(period_end instanceof Date) && typeof period_end !== 'string') {
      errors.push("period_end must be a valid date");
    }
    
    if (file_path !== undefined && typeof file_path !== 'string') {
      errors.push("file_path must be a string");
    } else if (file_path && file_path.length > 255) {
      errors.push("file_path must be less than 255 characters");
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, error: "Validation failed", details: errors });
    }

    try {
      const newDSFinvKExport = await prisma.dSFinvKExport.create({
        data: { 
          period_start: period_start ? new Date(period_start) : null,
          period_end: period_end ? new Date(period_end) : null,
          file_path: file_path || null
        },
      });
      res.status(201).json({ success: true, data: newDSFinvKExport });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ success: false, error: "Error creating DSFinvK export", details: err.message });
    }
  }
);

// ----------------------------
// PATCH DSFinvK export (Admin only)
// ----------------------------
router.patch(
  "/:id",
  attachUser,
  requireRoles([Role.ADMIN]),
  async (req: Request<{ id: string }, {}, UpdateDSFinvKExportRequest>, res: Response<ApiResponse<DSFinvKExport>>) => {
    const { id } = req.params;
    const { period_start, period_end, file_path } = req.body;

    // Validate input
    const errors: string[] = [];
    
    if (period_start !== undefined && !(period_start instanceof Date) && typeof period_start !== 'string') {
      errors.push("period_start must be a valid date");
    }
    
    if (period_end !== undefined && !(period_end instanceof Date) && typeof period_end !== 'string') {
      errors.push("period_end must be a valid date");
    }
    
    if (file_path !== undefined && typeof file_path !== 'string') {
      errors.push("file_path must be a string");
    } else if (file_path && file_path.length > 255) {
      errors.push("file_path must be less than 255 characters");
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, error: "Validation failed", details: errors });
    }

    try {
      // Check if DSFinvK export exists
      const existingDSFinvKExport = await prisma.dSFinvKExport.findUnique({ where: { id: Number(id) } });
      if (!existingDSFinvKExport) {
        return res.status(404).json({ success: false, error: `DSFinvK export with id "${id}" not found` });
      }

      // Build update data object dynamically
      const updateData: any = {};
      if (period_start !== undefined) updateData.period_start = period_start ? new Date(period_start) : null;
      if (period_end !== undefined) updateData.period_end = period_end ? new Date(period_end) : null;
      if (file_path !== undefined) updateData.file_path = file_path;

      const updatedDSFinvKExport = await prisma.dSFinvKExport.update({
        where: { id: Number(id) },
        data: updateData,
      });
      res.json({ success: true, data: updatedDSFinvKExport });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ success: false, error: "Error updating DSFinvK export", details: err.message });
    }
  }
);

// ----------------------------
// DELETE DSFinvK export (Admin only)
// ----------------------------
router.delete(
  "/:id",
  attachUser,
  requireRoles([Role.ADMIN]),
  async (req: Request<{ id: string }>, res: Response<ApiResponse<null>>) => {
    const { id } = req.params;
    
    try {
      // Check if DSFinvK export exists
      const existingDSFinvKExport = await prisma.dSFinvKExport.findUnique({ where: { id: Number(id) } });
      if (!existingDSFinvKExport) {
        return res.status(404).json({ success: false, error: `DSFinvK export with id "${id}" not found` });
      }

      // Delete the DSFinvK export
      await prisma.dSFinvKExport.delete({ where: { id: Number(id) } });
      res.json({ success: true, data: null });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ success: false, error: "Error deleting DSFinvK export", details: err.message });
    }
  }
);

export default router;
