import { Router } from "express";
import type { Request, Response } from "express";
import { PrismaClient, type AuditLog } from "@prisma/client";
import type { ApiResponse } from "../types/ApiResponse.js";
import { attachUser } from "../middleware/auth.js";
import { Role } from "../middleware/roles.js";
import { requireRoles } from "../middleware/rbac.js";

const prisma = new PrismaClient();
const router = Router();

// Type definitions for audit log requests and responses
type CreateAuditLogRequest = Omit<AuditLog, 'id' | 'timestamp'>;
type UpdateAuditLogRequest = Partial<Pick<AuditLog, 'table_name' | 'record_id' | 'action' | 'old_value' | 'new_value'>>;

// ----------------------------
// GET all audit logs (Admin only)
// ----------------------------
router.get(
  "/",
  attachUser,
  requireRoles([Role.ADMIN]),
  async (req: Request, res: Response<ApiResponse<AuditLog[]>>) => {
    try {
      const auditLogs = await prisma.auditLog.findMany({
        orderBy: { timestamp: "desc" }
      });
      res.json({ success: true, data: auditLogs });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ success: false, error: "Error fetching audit logs", details: err.message });
    }
  }
);

// ----------------------------
// GET audit log by ID (Admin only)
// ----------------------------
router.get("/:id", attachUser, requireRoles([Role.ADMIN]), async (req: Request<{ id: string }>, res: Response<ApiResponse<AuditLog>>) => {
  const { id } = req.params;

  try {
    const auditLog = await prisma.auditLog.findUnique({ where: { id: Number(id) } });
    if (!auditLog) {
      return res.status(404).json({ success: false, error: `Audit log with id "${id}" not found` });
    }

    res.json({ success: true, data: auditLog });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, error: "Error fetching audit log", details: err.message });
  }
});

// ----------------------------
// CREATE audit log (Admin only)
// ----------------------------
router.post(
  "/",
  attachUser,
  requireRoles([Role.ADMIN]),
  async (req: Request<{}, {}, CreateAuditLogRequest>, res: Response<ApiResponse<AuditLog>>) => {
    const { table_name, record_id, action, user_id, old_value, new_value } = req.body;

    // Validate input
    const errors: string[] = [];
    
    if (table_name !== undefined && typeof table_name !== 'string') {
      errors.push("table_name must be a string");
    } else if (table_name && table_name.length > 50) {
      errors.push("table_name must be less than 50 characters");
    }
    
    if (record_id !== undefined && typeof record_id !== 'number') {
      errors.push("record_id must be a number");
    }
    
    if (action !== undefined && typeof action !== 'string') {
      errors.push("action must be a string");
    } else if (action && action.length > 50) {
      errors.push("action must be less than 50 characters");
    }
    
    if (user_id !== undefined && typeof user_id !== 'number') {
      errors.push("user_id must be a number");
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, error: "Validation failed", details: errors });
    }

    try {
      // Build create data object dynamically to avoid TypeScript issues
      const createData: any = {};
      if (table_name !== undefined) createData.table_name = table_name;
      if (record_id !== undefined) createData.record_id = record_id;
      if (action !== undefined) createData.action = action;
      if (user_id !== undefined) createData.user_id = user_id;
      if (old_value !== undefined) createData.old_value = old_value;
      if (new_value !== undefined) createData.new_value = new_value;

      const newAuditLog = await prisma.auditLog.create({
        data: createData,
      });
      res.status(201).json({ success: true, data: newAuditLog });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ success: false, error: "Error creating audit log", details: err.message });
    }
  }
);

// ----------------------------
// PATCH audit log (Admin only)
// ----------------------------
router.patch(
  "/:id",
  attachUser,
  requireRoles([Role.ADMIN]),
  async (req: Request<{ id: string }, {}, UpdateAuditLogRequest>, res: Response<ApiResponse<AuditLog>>) => {
    const { id } = req.params;
    const { table_name, record_id, action, old_value, new_value } = req.body;

    // Validate input
    const errors: string[] = [];
    
    if (table_name !== undefined && typeof table_name !== 'string') {
      errors.push("table_name must be a string");
    } else if (table_name && table_name.length > 50) {
      errors.push("table_name must be less than 50 characters");
    }
    
    if (record_id !== undefined && typeof record_id !== 'number') {
      errors.push("record_id must be a number");
    }
    
    if (action !== undefined && typeof action !== 'string') {
      errors.push("action must be a string");
    } else if (action && action.length > 50) {
      errors.push("action must be less than 50 characters");
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, error: "Validation failed", details: errors });
    }

    try {
      // Check if audit log exists
      const existingAuditLog = await prisma.auditLog.findUnique({ where: { id: Number(id) } });
      if (!existingAuditLog) {
        return res.status(404).json({ success: false, error: `Audit log with id "${id}" not found` });
      }

      // Build update data object dynamically to avoid TypeScript issues
      const updateData: any = {};
      if (table_name !== undefined) updateData.table_name = table_name;
      if (record_id !== undefined) updateData.record_id = record_id;
      if (action !== undefined) updateData.action = action;
      if (old_value !== undefined) updateData.old_value = old_value;
      if (new_value !== undefined) updateData.new_value = new_value;

      const updatedAuditLog = await prisma.auditLog.update({
        where: { id: Number(id) },
        data: updateData,
      });
      res.json({ success: true, data: updatedAuditLog });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ success: false, error: "Error updating audit log", details: err.message });
    }
  }
);

// ----------------------------
// DELETE audit log (Admin only)
// ----------------------------
router.delete(
  "/:id",
  attachUser,
  requireRoles([Role.ADMIN]),
  async (req: Request<{ id: string }>, res: Response<ApiResponse<null>>) => {
    const { id } = req.params;
    
    try {
      // Check if audit log exists
      const existingAuditLog = await prisma.auditLog.findUnique({ where: { id: Number(id) } });
      if (!existingAuditLog) {
        return res.status(404).json({ success: false, error: `Audit log with id "${id}" not found` });
      }

      // Delete the audit log
      await prisma.auditLog.delete({ where: { id: Number(id) } });
      res.json({ success: true, data: null });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ success: false, error: "Error deleting audit log", details: err.message });
    }
  }
);

export default router;
