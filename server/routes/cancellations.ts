import { Router } from "express";
import type { Request, Response } from "express";
import { PrismaClient, type Cancellation } from "@prisma/client";
import type { ApiResponse } from "../types/ApiResponse.js";
import { attachUser } from "../middleware/auth.js";
import { Role } from "../middleware/roles.js";
import { requireRoles } from "../middleware/rbac.js";

const prisma = new PrismaClient();
const router = Router();

// Type definitions for cancellation requests and responses
type CreateCancellationRequest = Omit<Cancellation, 'id' | 'canceled_at'>;
type UpdateCancellationRequest = Partial<Pick<Cancellation, 'reason' | 'amount_cents' | 'payment_method' | 'stock_adjusted'>>;

// ----------------------------
// GET all cancellations (Admin only)
// ----------------------------
router.get(
  "/",
  attachUser,
  requireRoles([Role.ADMIN]),
  async (req: Request, res: Response<ApiResponse<Cancellation[]>>) => {
    try {
      const cancellations = await prisma.cancellation.findMany({
        orderBy: { canceled_at: "desc" }
      });
      res.json({ success: true, data: cancellations });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ success: false, error: "Error fetching cancellations", details: err.message });
    }
  }
);

// ----------------------------
// GET cancellation by ID (Admin only)
// ----------------------------
router.get("/:id", attachUser, requireRoles([Role.ADMIN]), async (req: Request<{ id: string }>, res: Response<ApiResponse<Cancellation>>) => {
  const { id } = req.params;

  try {
    const cancellation = await prisma.cancellation.findUnique({ where: { id: Number(id) } });
    if (!cancellation) {
      return res.status(404).json({ success: false, error: `Cancellation with id "${id}" not found` });
    }

    res.json({ success: true, data: cancellation });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, error: "Error fetching cancellation", details: err.message });
  }
});

// ----------------------------
// CREATE cancellation (Admin only)
// ----------------------------
router.post(
  "/",
  attachUser,
  requireRoles([Role.ADMIN]),
  async (req: Request<{}, {}, CreateCancellationRequest>, res: Response<ApiResponse<Cancellation>>) => {
    const { receipt_number, register_id, tse_signature, user_id, reason, amount_cents, payment_method, stock_adjusted } = req.body;

    // Validate input
    const errors: string[] = [];
    
    if (!receipt_number) {
      errors.push("receipt_number is required");
    } else if (receipt_number.length > 50) {
      errors.push("receipt_number must be less than 50 characters");
    }
    
    if (register_id !== undefined && typeof register_id !== 'number') {
      errors.push("register_id must be a number");
    }
    
    if (user_id !== undefined && typeof user_id !== 'number') {
      errors.push("user_id must be a number");
    }
    
    if (reason !== undefined && typeof reason !== 'string') {
      errors.push("reason must be a string");
    } else if (reason && reason.length > 200) {
      errors.push("reason must be less than 200 characters");
    }
    
    if (amount_cents !== undefined && (typeof amount_cents !== 'number' || amount_cents < 0)) {
      errors.push("amount_cents must be a non-negative number");
    }
    
    if (payment_method !== undefined && typeof payment_method !== 'string') {
      errors.push("payment_method must be a string");
    } else if (payment_method && payment_method.length > 50) {
      errors.push("payment_method must be less than 50 characters");
    }
    
    if (stock_adjusted !== undefined && typeof stock_adjusted !== 'boolean') {
      errors.push("stock_adjusted must be a boolean");
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, error: "Validation failed", details: errors });
    }

    try {
      const newCancellation = await prisma.cancellation.create({
        data: { 
          receipt_number: receipt_number || null,
          register_id: register_id || null,
          tse_signature: tse_signature || null,
          user_id: user_id || null,
          reason: reason || null,
          amount_cents: amount_cents || null,
          payment_method: payment_method || null,
          stock_adjusted: stock_adjusted || false
        },
      });
      res.status(201).json({ success: true, data: newCancellation });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ success: false, error: "Error creating cancellation", details: err.message });
    }
  }
);

// ----------------------------
// PATCH cancellation (Admin only)
// ----------------------------
router.patch(
  "/:id",
  attachUser,
  requireRoles([Role.ADMIN]),
  async (req: Request<{ id: string }, {}, UpdateCancellationRequest>, res: Response<ApiResponse<Cancellation>>) => {
    const { id } = req.params;
    const { reason, amount_cents, payment_method, stock_adjusted } = req.body;

    // Validate input
    const errors: string[] = [];
    
    if (reason !== undefined && typeof reason !== 'string') {
      errors.push("reason must be a string");
    } else if (reason && reason.length > 200) {
      errors.push("reason must be less than 200 characters");
    }
    
    if (amount_cents !== undefined && (typeof amount_cents !== 'number' || amount_cents < 0)) {
      errors.push("amount_cents must be a non-negative number");
    }
    
    if (payment_method !== undefined && typeof payment_method !== 'string') {
      errors.push("payment_method must be a string");
    } else if (payment_method && payment_method.length > 50) {
      errors.push("payment_method must be less than 50 characters");
    }
    
    if (stock_adjusted !== undefined && typeof stock_adjusted !== 'boolean') {
      errors.push("stock_adjusted must be a boolean");
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, error: "Validation failed", details: errors });
    }

    try {
      // Check if cancellation exists
      const existingCancellation = await prisma.cancellation.findUnique({ where: { id: Number(id) } });
      if (!existingCancellation) {
        return res.status(404).json({ success: false, error: `Cancellation with id "${id}" not found` });
      }

      // Build update data object dynamically
      const updateData: any = {};
      if (reason !== undefined) updateData.reason = reason;
      if (amount_cents !== undefined) updateData.amount_cents = amount_cents;
      if (payment_method !== undefined) updateData.payment_method = payment_method;
      if (stock_adjusted !== undefined) updateData.stock_adjusted = stock_adjusted;

      const updatedCancellation = await prisma.cancellation.update({
        where: { id: Number(id) },
        data: updateData,
      });
      res.json({ success: true, data: updatedCancellation });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ success: false, error: "Error updating cancellation", details: err.message });
    }
  }
);

// ----------------------------
// DELETE cancellation (Admin only)
// ----------------------------
router.delete(
  "/:id",
  attachUser,
  requireRoles([Role.ADMIN]),
  async (req: Request<{ id: string }>, res: Response<ApiResponse<null>>) => {
    const { id } = req.params;
    
    try {
      // Check if cancellation exists
      const existingCancellation = await prisma.cancellation.findUnique({ where: { id: Number(id) } });
      if (!existingCancellation) {
        return res.status(404).json({ success: false, error: `Cancellation with id "${id}" not found` });
      }

      // Delete the cancellation
      await prisma.cancellation.delete({ where: { id: Number(id) } });
      res.json({ success: true, data: null });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ success: false, error: "Error deleting cancellation", details: err.message });
    }
  }
);

export default router;
