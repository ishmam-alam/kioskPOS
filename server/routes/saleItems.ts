import { Router } from "express";
import type { Request, Response } from "express";
import { PrismaClient, type SaleItem } from "@prisma/client";
import type { ApiResponse } from "../types/ApiResponse.js";
import { attachUser } from "../middleware/auth.js";
import { Role } from "../middleware/roles.js";
import { requireRoles } from "../middleware/rbac.js";

const prisma = new PrismaClient();
const router = Router();

// Type definitions for sale item requests and responses
type CreateSaleItemRequest = Omit<SaleItem, 'id'>;
type UpdateSaleItemRequest = Partial<Omit<SaleItem, 'id' | 'receipt_number' | 'product_id'>>;

// ----------------------------
// GET all sale items (Admin only)
// ----------------------------
router.get(
  "/",
  attachUser,
  requireRoles([Role.ADMIN]),
  async (req: Request, res: Response<ApiResponse<SaleItem[]>>) => {
    try {
      const saleItems = await prisma.saleItem.findMany({
        orderBy: { id: "asc" }
      });
      res.json({ success: true, data: saleItems });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ success: false, error: "Error fetching sale items", details: err.message });
    }
  }
);

// ----------------------------
// GET sale item by ID (Admin only)
// ----------------------------
router.get("/:id", attachUser, requireRoles([Role.ADMIN]), async (req: Request<{ id: string }>, res: Response<ApiResponse<SaleItem>>) => {
  const { id } = req.params;

  try {
    const saleItem = await prisma.saleItem.findUnique({ where: { id: Number(id) } });
    if (!saleItem) {
      return res.status(404).json({ success: false, error: `Sale item with id "${id}" not found` });
    }

    res.json({ success: true, data: saleItem });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, error: "Error fetching sale item", details: err.message });
  }
});

// ----------------------------
// CREATE sale item (Admin only)
// ----------------------------
router.post(
  "/",
  attachUser,
  requireRoles([Role.ADMIN]),
  async (req: Request<{}, {}, CreateSaleItemRequest>, res: Response<ApiResponse<SaleItem>>) => {
    const { receipt_number, product_id, qty, unit_price_cents, tax_rate, stock_adjusted } = req.body;

    // Validate input
    const errors: string[] = [];
    
    if (!receipt_number) {
      errors.push("receipt_number is required");
    } else if (receipt_number.length > 50) {
      errors.push("receipt_number must be less than 50 characters");
    }
    
    if (!product_id) {
      errors.push("product_id is required");
    } else if (typeof product_id !== 'number') {
      errors.push("product_id must be a number");
    }
    
    if (!qty) {
      errors.push("qty is required");
    } else if (typeof qty !== 'number' || qty <= 0) {
      errors.push("qty must be a positive number");
    }
    
    if (!unit_price_cents) {
      errors.push("unit_price_cents is required");
    } else if (typeof unit_price_cents !== 'number' || unit_price_cents < 0) {
      errors.push("unit_price_cents must be a non-negative number");
    }
    
    if (tax_rate !== undefined && typeof tax_rate !== 'number') {
      errors.push("tax_rate must be a number");
    }
    
    if (stock_adjusted !== undefined && typeof stock_adjusted !== 'boolean') {
      errors.push("stock_adjusted must be a boolean");
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, error: "Validation failed", details: errors });
    }

    try {
      const newSaleItem = await prisma.saleItem.create({
        data: { 
          receipt_number,
          product_id,
          qty,
          unit_price_cents,
          tax_rate: tax_rate || null,
          stock_adjusted: stock_adjusted || false
        },
      });
      res.status(201).json({ success: true, data: newSaleItem });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ success: false, error: "Error creating sale item", details: err.message });
    }
  }
);

// ----------------------------
// PATCH sale item (Admin only)
// ----------------------------
router.patch(
  "/:id",
  attachUser,
  requireRoles([Role.ADMIN]),
  async (req: Request<{ id: string }, {}, UpdateSaleItemRequest>, res: Response<ApiResponse<SaleItem>>) => {
    const { id } = req.params;
    const { qty, unit_price_cents, tax_rate, stock_adjusted } = req.body;

    // Validate input
    const errors: string[] = [];
    
    if (qty !== undefined && (typeof qty !== 'number' || qty <= 0)) {
      errors.push("qty must be a positive number");
    }
    
    if (unit_price_cents !== undefined && (typeof unit_price_cents !== 'number' || unit_price_cents < 0)) {
      errors.push("unit_price_cents must be a non-negative number");
    }
    
    if (tax_rate !== undefined && typeof tax_rate !== 'number') {
      errors.push("tax_rate must be a number");
    }
    
    if (stock_adjusted !== undefined && typeof stock_adjusted !== 'boolean') {
      errors.push("stock_adjusted must be a boolean");
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, error: "Validation failed", details: errors });
    }

    try {
      // Check if sale item exists
      const existingSaleItem = await prisma.saleItem.findUnique({ where: { id: Number(id) } });
      if (!existingSaleItem) {
        return res.status(404).json({ success: false, error: `Sale item with id "${id}" not found` });
      }

      // Build update data object dynamically
      const updateData: any = {};
      if (qty !== undefined) updateData.qty = qty;
      if (unit_price_cents !== undefined) updateData.unit_price_cents = unit_price_cents;
      if (tax_rate !== undefined) updateData.tax_rate = tax_rate;
      if (stock_adjusted !== undefined) updateData.stock_adjusted = stock_adjusted;

      const updatedSaleItem = await prisma.saleItem.update({
        where: { id: Number(id) },
        data: updateData,
      });
      res.json({ success: true, data: updatedSaleItem });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ success: false, error: "Error updating sale item", details: err.message });
    }
  }
);

// ----------------------------
// DELETE sale item (Admin only)
// ----------------------------
router.delete(
  "/:id",
  attachUser,
  requireRoles([Role.ADMIN]),
  async (req: Request<{ id: string }>, res: Response<ApiResponse<null>>) => {
    const { id } = req.params;
    
    try {
      // Check if sale item exists
      const existingSaleItem = await prisma.saleItem.findUnique({ where: { id: Number(id) } });
      if (!existingSaleItem) {
        return res.status(404).json({ success: false, error: `Sale item with id "${id}" not found` });
      }

      // Delete the sale item
      await prisma.saleItem.delete({ where: { id: Number(id) } });
      res.json({ success: true, data: null });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ success: false, error: "Error deleting sale item", details: err.message });
    }
  }
);

export default router;
