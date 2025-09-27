import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { attachUser } from "../middleware/auth.js";
import { Role } from "../middleware/roles.js";
import { requireRoles } from "../middleware/rbac.js";
const prisma = new PrismaClient();
const router = Router();
// ----------------------------
// GET all stock ins (Admin only)
// ----------------------------
router.get("/", attachUser, requireRoles([Role.ADMIN]), async (req, res) => {
    try {
        const stockIns = await prisma.stockIn.findMany({
            orderBy: { received_at: "desc" }
        });
        res.json({ success: true, data: stockIns });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Error fetching stock ins", details: err.message });
    }
});
// ----------------------------
// GET stock in by ID (Admin only)
// ----------------------------
router.get("/:id", attachUser, requireRoles([Role.ADMIN]), async (req, res) => {
    const { id } = req.params;
    try {
        const stockIn = await prisma.stockIn.findUnique({ where: { id: Number(id) } });
        if (!stockIn) {
            return res.status(404).json({ success: false, error: `Stock in with id "${id}" not found` });
        }
        res.json({ success: true, data: stockIn });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Error fetching stock in", details: err.message });
    }
});
// ----------------------------
// CREATE stock in (Admin only)
// ----------------------------
router.post("/", attachUser, requireRoles([Role.ADMIN]), async (req, res) => {
    const { product_id, added_qty, supplier, user_id, stock_adjusted } = req.body;
    // Validate input
    const errors = [];
    if (!added_qty) {
        errors.push("added_qty is required");
    }
    else if (typeof added_qty !== 'number' || added_qty <= 0) {
        errors.push("added_qty must be a positive number");
    }
    if (product_id !== undefined && typeof product_id !== 'number') {
        errors.push("product_id must be a number");
    }
    if (user_id !== undefined && typeof user_id !== 'number') {
        errors.push("user_id must be a number");
    }
    if (supplier !== undefined && typeof supplier !== 'string') {
        errors.push("supplier must be a string");
    }
    else if (supplier && supplier.length > 100) {
        errors.push("supplier must be less than 100 characters");
    }
    if (stock_adjusted !== undefined && typeof stock_adjusted !== 'boolean') {
        errors.push("stock_adjusted must be a boolean");
    }
    if (errors.length > 0) {
        return res.status(400).json({ success: false, error: "Validation failed", details: errors });
    }
    try {
        const newStockIn = await prisma.stockIn.create({
            data: {
                product_id: product_id || null,
                added_qty,
                supplier: supplier || null,
                user_id: user_id || null,
                stock_adjusted: stock_adjusted || false
            },
        });
        res.status(201).json({ success: true, data: newStockIn });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Error creating stock in", details: err.message });
    }
});
// ----------------------------
// PATCH stock in (Admin only)
// ----------------------------
router.patch("/:id", attachUser, requireRoles([Role.ADMIN]), async (req, res) => {
    const { id } = req.params;
    const { added_qty, supplier, stock_adjusted } = req.body;
    // Validate input
    const errors = [];
    if (added_qty !== undefined && (typeof added_qty !== 'number' || added_qty <= 0)) {
        errors.push("added_qty must be a positive number");
    }
    if (supplier !== undefined && typeof supplier !== 'string') {
        errors.push("supplier must be a string");
    }
    else if (supplier && supplier.length > 100) {
        errors.push("supplier must be less than 100 characters");
    }
    if (stock_adjusted !== undefined && typeof stock_adjusted !== 'boolean') {
        errors.push("stock_adjusted must be a boolean");
    }
    if (errors.length > 0) {
        return res.status(400).json({ success: false, error: "Validation failed", details: errors });
    }
    try {
        // Check if stock in exists
        const existingStockIn = await prisma.stockIn.findUnique({ where: { id: Number(id) } });
        if (!existingStockIn) {
            return res.status(404).json({ success: false, error: `Stock in with id "${id}" not found` });
        }
        // Build update data object dynamically
        const updateData = {};
        if (added_qty !== undefined)
            updateData.added_qty = added_qty;
        if (supplier !== undefined)
            updateData.supplier = supplier;
        if (stock_adjusted !== undefined)
            updateData.stock_adjusted = stock_adjusted;
        const updatedStockIn = await prisma.stockIn.update({
            where: { id: Number(id) },
            data: updateData,
        });
        res.json({ success: true, data: updatedStockIn });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Error updating stock in", details: err.message });
    }
});
// ----------------------------
// DELETE stock in (Admin only)
// ----------------------------
router.delete("/:id", attachUser, requireRoles([Role.ADMIN]), async (req, res) => {
    const { id } = req.params;
    try {
        // Check if stock in exists
        const existingStockIn = await prisma.stockIn.findUnique({ where: { id: Number(id) } });
        if (!existingStockIn) {
            return res.status(404).json({ success: false, error: `Stock in with id "${id}" not found` });
        }
        // Delete the stock in
        await prisma.stockIn.delete({ where: { id: Number(id) } });
        res.json({ success: true, data: null });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Error deleting stock in", details: err.message });
    }
});
export default router;
//# sourceMappingURL=stockIns.js.map