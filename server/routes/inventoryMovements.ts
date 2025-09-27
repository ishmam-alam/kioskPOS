import { Router } from "express";
import type { Request, Response } from "express";
import { PrismaClient, type InventoryMovement } from "@prisma/client";
import type { ApiResponse } from "../types/ApiResponse.js";
import { attachUser } from "../middleware/auth.js";
import { Role } from "../middleware/roles.js";
import { requireRoles } from "../middleware/rbac.js";

const prisma = new PrismaClient();
const router = Router();

// Type definitions for inventory movement requests and responses
type CreateInventoryMovementRequest = Omit<InventoryMovement, 'id' | 'created_at'>;
type UpdateInventoryMovementRequest = Partial<Pick<InventoryMovement, 'change_qty' | 'resulting_qty' | 'movement_type' | 'reference_table' | 'reference_id' | 'note'>>;

// ----------------------------
// GET all inventory movements (Admin only)
// ----------------------------
router.get(
  "/",
  attachUser,
  requireRoles([Role.ADMIN]),
  async (req: Request, res: Response<ApiResponse<InventoryMovement[]>>) => {
    try {
      const inventoryMovements = await prisma.inventoryMovement.findMany({
        orderBy: { created_at: "desc" }
      });
      res.json({ success: true, data: inventoryMovements });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ success: false, error: "Error fetching inventory movements", details: err.message });
    }
  }
);

// ----------------------------
// GET inventory movement by ID (Admin only)
// ----------------------------
router.get("/:id", attachUser, requireRoles([Role.ADMIN]), async (req: Request<{ id: string }>, res: Response<ApiResponse<InventoryMovement>>) => {
  const { id } = req.params;

  try {
    const inventoryMovement = await prisma.inventoryMovement.findUnique({ where: { id: Number(id) } });
    if (!inventoryMovement) {
      return res.status(404).json({ success: false, error: `Inventory movement with id "${id}" not found` });
    }

    res.json({ success: true, data: inventoryMovement });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, error: "Error fetching inventory movement", details: err.message });
  }
});

// ----------------------------
// CREATE inventory movement (Admin only)
// ----------------------------
router.post(
  "/",
  attachUser,
  requireRoles([Role.ADMIN]),
  async (req: Request<{}, {}, CreateInventoryMovementRequest>, res: Response<ApiResponse<InventoryMovement>>) => {
    const { product_id, user_id, change_qty, resulting_qty, movement_type, reference_table, reference_id, note } = req.body;

    // Validate input
    const errors: string[] = [];
    
    if (product_id !== undefined && typeof product_id !== 'number') {
      errors.push("product_id must be a number");
    }
    
    if (user_id !== undefined && typeof user_id !== 'number') {
      errors.push("user_id must be a number");
    }
    
    if (change_qty !== undefined && typeof change_qty !== 'number') {
      errors.push("change_qty must be a number");
    }
    
    if (resulting_qty !== undefined && typeof resulting_qty !== 'number') {
      errors.push("resulting_qty must be a number");
    }
    
    if (movement_type !== undefined && typeof movement_type !== 'string') {
      errors.push("movement_type must be a string");
    } else if (movement_type && movement_type.length > 50) {
      errors.push("movement_type must be less than 50 characters");
    }
    
    if (reference_table !== undefined && typeof reference_table !== 'string') {
      errors.push("reference_table must be a string");
    } else if (reference_table && reference_table.length > 50) {
      errors.push("reference_table must be less than 50 characters");
    }
    
    if (reference_id !== undefined && typeof reference_id !== 'number') {
      errors.push("reference_id must be a number");
    }
    
    if (note !== undefined && typeof note !== 'string') {
      errors.push("note must be a string");
    } else if (note && note.length > 255) {
      errors.push("note must be less than 255 characters");
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, error: "Validation failed", details: errors });
    }

    try {
      // Build create data object dynamically to avoid TypeScript issues
      const createData: any = {};
      if (product_id !== undefined) createData.product_id = product_id;
      if (user_id !== undefined) createData.user_id = user_id;
      if (change_qty !== undefined) createData.change_qty = change_qty;
      if (resulting_qty !== undefined) createData.resulting_qty = resulting_qty;
      if (movement_type !== undefined) createData.movement_type = movement_type;
      if (reference_table !== undefined) createData.reference_table = reference_table;
      if (reference_id !== undefined) createData.reference_id = reference_id;
      if (note !== undefined) createData.note = note;

      const newInventoryMovement = await prisma.inventoryMovement.create({
        data: createData,
      });
      res.status(201).json({ success: true, data: newInventoryMovement });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ success: false, error: "Error creating inventory movement", details: err.message });
    }
  }
);

// ----------------------------
// PATCH inventory movement (Admin only)
// ----------------------------
router.patch(
  "/:id",
  attachUser,
  requireRoles([Role.ADMIN]),
  async (req: Request<{ id: string }, {}, UpdateInventoryMovementRequest>, res: Response<ApiResponse<InventoryMovement>>) => {
    const { id } = req.params;
    const { change_qty, resulting_qty, movement_type, reference_table, reference_id, note } = req.body;

    // Validate input
    const errors: string[] = [];
    
    if (change_qty !== undefined && typeof change_qty !== 'number') {
      errors.push("change_qty must be a number");
    }
    
    if (resulting_qty !== undefined && typeof resulting_qty !== 'number') {
      errors.push("resulting_qty must be a number");
    }
    
    if (movement_type !== undefined && typeof movement_type !== 'string') {
      errors.push("movement_type must be a string");
    } else if (movement_type && movement_type.length > 50) {
      errors.push("movement_type must be less than 50 characters");
    }
    
    if (reference_table !== undefined && typeof reference_table !== 'string') {
      errors.push("reference_table must be a string");
    } else if (reference_table && reference_table.length > 50) {
      errors.push("reference_table must be less than 50 characters");
    }
    
    if (reference_id !== undefined && typeof reference_id !== 'number') {
      errors.push("reference_id must be a number");
    }
    
    if (note !== undefined && typeof note !== 'string') {
      errors.push("note must be a string");
    } else if (note && note.length > 255) {
      errors.push("note must be less than 255 characters");
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, error: "Validation failed", details: errors });
    }

    try {
      // Check if inventory movement exists
      const existingInventoryMovement = await prisma.inventoryMovement.findUnique({ where: { id: Number(id) } });
      if (!existingInventoryMovement) {
        return res.status(404).json({ success: false, error: `Inventory movement with id "${id}" not found` });
      }

      // Build update data object dynamically to avoid TypeScript issues
      const updateData: any = {};
      if (change_qty !== undefined) updateData.change_qty = change_qty;
      if (resulting_qty !== undefined) updateData.resulting_qty = resulting_qty;
      if (movement_type !== undefined) updateData.movement_type = movement_type;
      if (reference_table !== undefined) updateData.reference_table = reference_table;
      if (reference_id !== undefined) updateData.reference_id = reference_id;
      if (note !== undefined) updateData.note = note;

      const updatedInventoryMovement = await prisma.inventoryMovement.update({
        where: { id: Number(id) },
        data: updateData,
      });
      res.json({ success: true, data: updatedInventoryMovement });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ success: false, error: "Error updating inventory movement", details: err.message });
    }
  }
);

// ----------------------------
// DELETE inventory movement (Admin only)
// ----------------------------
router.delete(
  "/:id",
  attachUser,
  requireRoles([Role.ADMIN]),
  async (req: Request<{ id: string }>, res: Response<ApiResponse<null>>) => {
    const { id } = req.params;
    
    try {
      // Check if inventory movement exists
      const existingInventoryMovement = await prisma.inventoryMovement.findUnique({ where: { id: Number(id) } });
      if (!existingInventoryMovement) {
        return res.status(404).json({ success: false, error: `Inventory movement with id "${id}" not found` });
      }

      // Delete the inventory movement
      await prisma.inventoryMovement.delete({ where: { id: Number(id) } });
      res.json({ success: true, data: null });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ success: false, error: "Error deleting inventory movement", details: err.message });
    }
  }
);

export default router;
