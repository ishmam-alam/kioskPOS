import { Router } from "express";
import type { Request, Response } from "express";
import { PrismaClient, type Sale, type SaleItem } from "@prisma/client";
import type { ApiResponse } from "../types/ApiResponse.js";
import { attachUser } from "../middleware/auth.js";
import { Role } from "../middleware/roles.js";
import { requireRoles } from "../middleware/rbac.js";

const prisma = new PrismaClient();
const router = Router();

// Type definitions for sale requests and responses
type CreateSaleRequest = {
  receipt_number: string;
  register_id?: number;
  tse_signature?: string;
  user_id?: number;
  total_cents: number;
  items?: any;
  payment_method?: string;
  saleItems?: Omit<SaleItem, 'id' | 'receipt_number'>[];
};

type UpdateSaleRequest = Partial<{
  register_id: number;
  tse_signature: string;
  end_at: Date;
  user_id: number;
  total_cents: number;
  items: any;
  payment_method: string;
}>;

// ----------------------------
// GET all sales
// ----------------------------
router.get(
  "/",
  attachUser,
  requireRoles([Role.ADMIN, Role.OWNER, Role.MANAGER, Role.CONTROLLER]),
  async (req: Request, res: Response<ApiResponse<(Sale & { saleItems?: SaleItem[] })[]>>) => {
    try {
      // Get query parameters for filtering
      const { register_id, user_id, start_date, end_date } = req.query;
      
      // Build where clause
      const whereClause: any = {};
      if (register_id) whereClause.register_id = Number(register_id);
      if (user_id) whereClause.user_id = Number(user_id);
      if (start_date || end_date) {
        whereClause.start_at = {};
        if (start_date) whereClause.start_at.gte = new Date(start_date as string);
        if (end_date) whereClause.start_at.lte = new Date(end_date as string);
      }
      
      const sales = await prisma.sale.findMany({
        where: whereClause,
        orderBy: { start_at: "desc" },
        include: {
          saleItems: true
        }
      });
      
      res.json({ success: true, data: sales });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ success: false, error: "Error fetching sales", details: err.message });
    }
  }
);

// ----------------------------
// GET sale by receipt_number
// ----------------------------
router.get("/:receipt_number", attachUser, requireRoles([Role.ADMIN, Role.OWNER, Role.MANAGER, Role.CONTROLLER]), async (req: Request<{ receipt_number: string }>, res: Response<ApiResponse<Sale & { saleItems?: SaleItem[] }>>) => {
  const { receipt_number } = req.params;

  try {
    const sale = await prisma.sale.findUnique({
      where: { receipt_number },
      include: {
        saleItems: true
      }
    });
    
    if (!sale) {
      return res.status(404).json({ success: false, error: `Sale with receipt_number "${receipt_number}" not found` });
    }

    res.json({ success: true, data: sale });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, error: "Error fetching sale", details: err.message });
  }
});

// ----------------------------
// CREATE sale
// ----------------------------
router.post(
  "/",
  attachUser,
  requireRoles([Role.ADMIN, Role.OWNER, Role.MANAGER, Role.EMPLOYEE]),
  async (req: Request<{}, {}, CreateSaleRequest>, res: Response<ApiResponse<Sale & { saleItems?: SaleItem[] }>>) => {
    const { receipt_number, register_id, tse_signature, user_id, total_cents, items, payment_method, saleItems } = req.body;

    // Validate input
    const errors: string[] = [];
    
    if (!receipt_number) {
      errors.push("receipt_number is required");
    } else if (receipt_number.length > 50) {
      errors.push("receipt_number must be less than 50 characters");
    }
    
    if (total_cents === undefined) {
      errors.push("total_cents is required");
    } else if (typeof total_cents !== 'number' || total_cents < 0) {
      errors.push("total_cents must be a non-negative number");
    }
    
    if (register_id !== undefined && typeof register_id !== 'number') {
      errors.push("register_id must be a number");
    }
    
    if (user_id !== undefined && typeof user_id !== 'number') {
      errors.push("user_id must be a number");
    }
    
    if (payment_method !== undefined && typeof payment_method !== 'string') {
      errors.push("payment_method must be a string");
    } else if (payment_method && payment_method.length > 50) {
      errors.push("payment_method must be less than 50 characters");
    }

    // Validate sale items if provided
    if (saleItems && Array.isArray(saleItems)) {
      for (let i = 0; i < saleItems.length; i++) {
        const item = saleItems[i];
        if (item) {
          if (!item.product_id) {
            errors.push(`saleItems[${i}]: product_id is required`);
          }
          if (!item.qty) {
            errors.push(`saleItems[${i}]: qty is required`);
          }
          if (!item.unit_price_cents) {
            errors.push(`saleItems[${i}]: unit_price_cents is required`);
          }
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, error: "Validation failed", details: errors });
    }

    try {
      // Check if receipt_number already exists
      const existingSale = await prisma.sale.findUnique({ where: { receipt_number } });
      if (existingSale) {
        return res.status(400).json({ success: false, error: `Sale with receipt_number "${receipt_number}" already exists` });
      }

      // Create sale with sale items in a transaction
      const newSale = await prisma.$transaction(async (prisma) => {
        // Create the sale
        const sale = await prisma.sale.create({
          data: {
            receipt_number,
            register_id: register_id || null,
            tse_signature: tse_signature || null,
            user_id: user_id || null,
            total_cents,
            items: items || null,
            payment_method: payment_method || null
          }
        });

        // Create sale items if provided
        if (saleItems && Array.isArray(saleItems) && saleItems.length > 0) {
          await prisma.saleItem.createMany({
            data: saleItems.map(item => ({
              receipt_number: sale.receipt_number,
              product_id: item.product_id,
              qty: item.qty,
              unit_price_cents: item.unit_price_cents,
              tax_rate: item.tax_rate || null
            }))
          });
        }

        // Fetch the complete sale with items
        return prisma.sale.findUnique({
          where: { receipt_number: sale.receipt_number },
          include: { saleItems: true }
        });
      });

      res.status(201).json({ success: true, data: newSale! });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ success: false, error: "Error creating sale", details: err.message });
    }
  }
);

// ----------------------------
// PATCH sale (update end time, etc.)
// ----------------------------
router.patch(
  "/:receipt_number",
  attachUser,
  requireRoles([Role.ADMIN, Role.OWNER, Role.MANAGER]),
  async (req: Request<{ receipt_number: string }, {}, UpdateSaleRequest>, res: Response<ApiResponse<Sale & { saleItems?: SaleItem[] }>>) => {
    const { receipt_number } = req.params;
    const { register_id, tse_signature, end_at, user_id, total_cents, items, payment_method } = req.body;

    // Validate input
    const errors: string[] = [];
    
    if (register_id !== undefined && typeof register_id !== 'number') {
      errors.push("register_id must be a number");
    }
    
    if (user_id !== undefined && typeof user_id !== 'number') {
      errors.push("user_id must be a number");
    }
    
    if (total_cents !== undefined && (typeof total_cents !== 'number' || total_cents < 0)) {
      errors.push("total_cents must be a non-negative number");
    }
    
    if (payment_method !== undefined && typeof payment_method !== 'string') {
      errors.push("payment_method must be a string");
    } else if (payment_method && payment_method.length > 50) {
      errors.push("payment_method must be less than 50 characters");
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, error: "Validation failed", details: errors });
    }

    try {
      // Check if sale exists
      const existingSale = await prisma.sale.findUnique({ where: { receipt_number } });
      if (!existingSale) {
        return res.status(404).json({ success: false, error: `Sale with receipt_number "${receipt_number}" not found` });
      }

      // Build update data object dynamically
      const updateData: any = {};
      if (register_id !== undefined) updateData.register_id = register_id;
      if (tse_signature !== undefined) updateData.tse_signature = tse_signature;
      if (end_at !== undefined) updateData.end_at = end_at;
      if (user_id !== undefined) updateData.user_id = user_id;
      if (total_cents !== undefined) updateData.total_cents = total_cents;
      if (items !== undefined) updateData.items = items;
      if (payment_method !== undefined) updateData.payment_method = payment_method;

      const updatedSale = await prisma.sale.update({
        where: { receipt_number },
        data: updateData,
        include: {
          saleItems: true
        }
      });
      res.json({ success: true, data: updatedSale });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ success: false, error: "Error updating sale", details: err.message });
    }
  }
);

// ----------------------------
// DELETE sale
// ----------------------------
router.delete(
  "/:receipt_number",
  attachUser,
  requireRoles([Role.ADMIN, Role.OWNER, Role.MANAGER]),
  async (req: Request<{ receipt_number: string }>, res: Response<ApiResponse<null>>) => {
    const { receipt_number } = req.params;
    
    try {
      // Check if sale exists
      const existingSale = await prisma.sale.findUnique({ where: { receipt_number } });
      if (!existingSale) {
        return res.status(404).json({ success: false, error: `Sale with receipt_number "${receipt_number}" not found` });
      }

      // Check if sale has associated cancellations
      const cancellationsCount = await prisma.cancellation.count({
        where: { receipt_number }
      });

      if (cancellationsCount > 0) {
        return res.status(400).json({ 
          success: false, 
          error: "Cannot delete sale with associated cancellations",
          details: `Sale has ${cancellationsCount} associated cancellations`
        });
      }

      // Delete sale items first, then the sale itself (in transaction)
      await prisma.$transaction(async (prisma) => {
        // Delete sale items
        await prisma.saleItem.deleteMany({
          where: { receipt_number }
        });
        
        // Delete the sale
        await prisma.sale.delete({ where: { receipt_number } });
      });

      res.json({ success: true, data: null });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ success: false, error: "Error deleting sale", details: err.message });
    }
  }
);

export default router;
