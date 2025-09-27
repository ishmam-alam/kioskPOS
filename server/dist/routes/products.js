import { Router } from "express";
import {} from "@prisma/client";
import { attachUser } from "../middleware/auth.js";
import { Role } from "../middleware/roles.js";
import { requireRoles } from "../middleware/rbac.js";
import { createProductSchema, updateProductSchema, validateRequest, validateParams, idParamSchema } from "../middleware/validation.js";
import { logger } from "../middleware/logger.js";
import prisma from "../lib/database.js";
const router = Router();
// ----------------------------
// GET all products
// ----------------------------
router.get("/", attachUser, async (req, res) => {
    try {
        // Default to showing only active products
        const showInactive = req.query.showInactive === 'true';
        const whereClause = showInactive ? {} : { active: true };
        const products = await prisma.product.findMany({
            where: whereClause,
            orderBy: { created_at: "desc" }
        });
        logger.info("Products fetched successfully", { count: products.length, showInactive });
        res.json({ success: true, data: products });
    }
    catch (err) {
        logger.error("Error fetching products", err);
        res.status(500).json({ success: false, error: "Error fetching products", details: err.message });
    }
});
// ----------------------------
// GET product by ID
// ----------------------------
router.get("/:id", attachUser, validateParams(idParamSchema), async (req, res) => {
    const id = req.validatedParams.id;
    try {
        const product = await prisma.product.findUnique({ where: { id } });
        if (!product) {
            return res.status(404).json({ success: false, error: `Product with id "${id}" not found` });
        }
        // Hide inactive products from non-staff users
        if (!product.active &&
            (!req.user || ![Role.ADMIN, Role.OWNER, Role.MANAGER].includes(req.user.role))) {
            return res.status(404).json({ success: false, error: `Product with id "${id}" not found` });
        }
        logger.info("Product fetched successfully", { productId: id });
        res.json({ success: true, data: product });
    }
    catch (err) {
        logger.error("Error fetching product", err);
        res.status(500).json({ success: false, error: "Error fetching product", details: err.message });
    }
});
// ----------------------------
// CREATE product
// ----------------------------
router.post("/", attachUser, requireRoles([Role.ADMIN, Role.OWNER, Role.MANAGER]), validateRequest(createProductSchema), async (req, res) => {
    try {
        let { sku, name, price_cents, stock_qty, tax_rate, active } = req.body;
        // Check if name is unique (case-insensitive)
        const existingProduct = await prisma.product.findFirst({
            where: {
                name: {
                    mode: 'insensitive',
                    equals: name
                }
            }
        });
        if (existingProduct) {
            return res.status(400).json({
                success: false,
                error: `Product with name "${name}" already exists (case-insensitive)`
            });
        }
        // Generate a unique SKU if not provided
        if (!sku) {
            const timestamp = Date.now().toString().slice(-6);
            const namePart = name.substring(0, 10).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
            sku = `${namePart}${timestamp}`;
            if (sku.length > 50) {
                sku = sku.substring(0, 50);
            }
        }
        const newProduct = await prisma.product.create({
            data: {
                sku,
                name,
                price_cents,
                stock_qty: stock_qty || 0,
                tax_rate: tax_rate || null,
                active
            },
        });
        logger.info(`Product created: ${newProduct.id}`, { productId: newProduct.id, sku, name });
        res.status(201).json({ success: true, data: newProduct });
    }
    catch (err) {
        logger.error("Error creating product", err);
        const errorMsg = err.code === "P2002" ? `Product with this sku already exists` : "Error creating product";
        res.status(500).json({ success: false, error: errorMsg, details: err.message });
    }
});
// ----------------------------
// PATCH product (partial update)
// ----------------------------
router.patch("/:id", attachUser, requireRoles([Role.ADMIN, Role.OWNER, Role.MANAGER, Role.EMPLOYEE]), validateParams(idParamSchema), validateRequest(updateProductSchema), async (req, res) => {
    const id = req.validatedParams.id;
    const { sku, name, price_cents, stock_qty, tax_rate, active } = req.body;
    try {
        // Check if product exists
        const existingProduct = await prisma.product.findUnique({ where: { id } });
        if (!existingProduct) {
            return res.status(404).json({ success: false, error: `Product with id "${id}" not found` });
        }
        // Check if name is unique (case-insensitive) when updating
        if (name !== undefined) {
            const existingProductWithName = await prisma.product.findFirst({
                where: {
                    name: {
                        mode: 'insensitive',
                        equals: name
                    },
                    id: {
                        not: id
                    }
                }
            });
            if (existingProductWithName) {
                return res.status(400).json({
                    success: false,
                    error: `Product with name "${name}" already exists (case-insensitive)`
                });
            }
        }
        // Build update data object
        const updateData = {};
        if (sku !== undefined)
            updateData.sku = sku;
        if (name !== undefined)
            updateData.name = name;
        if (price_cents !== undefined)
            updateData.price_cents = price_cents;
        if (stock_qty !== undefined)
            updateData.stock_qty = stock_qty;
        if (tax_rate !== undefined)
            updateData.tax_rate = tax_rate;
        if (active !== undefined)
            updateData.active = active;
        const updatedProduct = await prisma.product.update({
            where: { id },
            data: updateData,
        });
        logger.info(`Product updated: ${id}`, { productId: id, updatedFields: Object.keys(updateData) });
        res.json({ success: true, data: updatedProduct });
    }
    catch (err) {
        logger.error("Error updating product", err);
        const errorMsg = err.code === "P2002" ? `Product with this sku already exists` : "Error updating product";
        res.status(500).json({ success: false, error: errorMsg, details: err.message });
    }
});
// ----------------------------
// DELETE product
// ----------------------------
router.delete("/:id", attachUser, requireRoles([Role.ADMIN, Role.OWNER, Role.MANAGER]), validateParams(idParamSchema), async (req, res) => {
    const id = req.validatedParams.id;
    try {
        // Check if product exists
        const existingProduct = await prisma.product.findUnique({ where: { id } });
        if (!existingProduct) {
            return res.status(404).json({ success: false, error: `Product with id "${id}" not found` });
        }
        // Check if product is used in any sale items
        const saleItemsCount = await prisma.saleItem.count({
            where: { product_id: id }
        });
        if (saleItemsCount > 0) {
            // Instead of deleting, mark as inactive
            const updatedProduct = await prisma.product.update({
                where: { id },
                data: { active: false }
            });
            logger.info(`Product marked as inactive: ${id}`, { productId: id, reason: "has sale history" });
            return res.json({
                success: true,
                data: null,
                details: "Product has sale history, marked as inactive instead of deletion"
            });
        }
        // If no sale history, actually delete the product
        await prisma.product.delete({ where: { id } });
        logger.info(`Product deleted: ${id}`, { productId: id });
        res.json({ success: true, data: null });
    }
    catch (err) {
        logger.error("Error deleting product", err);
        res.status(500).json({ success: false, error: "Error deleting product", details: err.message });
    }
});
export default router;
//# sourceMappingURL=products.js.map