import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { attachUser } from "../middleware/auth.js";
import { Role } from "../middleware/roles.js";
import { requireRoles } from "../middleware/rbac.js";
const prisma = new PrismaClient();
const router = Router();
// ----------------------------
// GET all turnovers (Admin only)
// ----------------------------
router.get("/", attachUser, requireRoles([Role.ADMIN]), async (req, res) => {
    try {
        const turnovers = await prisma.turnover.findMany({
            orderBy: { created_at: "desc" }
        });
        res.json({ success: true, data: turnovers });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Error fetching turnovers", details: err.message });
    }
});
// ----------------------------
// GET turnover by ID (Admin only)
// ----------------------------
router.get("/:id", attachUser, requireRoles([Role.ADMIN]), async (req, res) => {
    const { id } = req.params;
    try {
        const turnover = await prisma.turnover.findUnique({ where: { id: Number(id) } });
        if (!turnover) {
            return res.status(404).json({ success: false, error: `Turnover with id "${id}" not found` });
        }
        res.json({ success: true, data: turnover });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Error fetching turnover", details: err.message });
    }
});
// ----------------------------
// CREATE turnover (Admin only)
// ----------------------------
router.post("/", attachUser, requireRoles([Role.ADMIN]), async (req, res) => {
    const { register_id, date, total_sales_cents, total_refunds_cents, net_turnover_cents } = req.body;
    // Validate input
    const errors = [];
    if (register_id !== undefined && typeof register_id !== 'number') {
        errors.push("register_id must be a number");
    }
    if (date !== undefined && !(date instanceof Date) && typeof date !== 'string') {
        errors.push("date must be a valid date");
    }
    if (total_sales_cents !== undefined && (typeof total_sales_cents !== 'number' || total_sales_cents < 0)) {
        errors.push("total_sales_cents must be a non-negative number");
    }
    if (total_refunds_cents !== undefined && (typeof total_refunds_cents !== 'number' || total_refunds_cents < 0)) {
        errors.push("total_refunds_cents must be a non-negative number");
    }
    if (net_turnover_cents !== undefined && typeof net_turnover_cents !== 'number') {
        errors.push("net_turnover_cents must be a number");
    }
    if (errors.length > 0) {
        return res.status(400).json({ success: false, error: "Validation failed", details: errors });
    }
    try {
        const newTurnover = await prisma.turnover.create({
            data: {
                register_id: register_id || null,
                date: date ? new Date(date) : null,
                total_sales_cents: total_sales_cents || 0,
                total_refunds_cents: total_refunds_cents || 0,
                net_turnover_cents: net_turnover_cents || 0
            },
        });
        res.status(201).json({ success: true, data: newTurnover });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Error creating turnover", details: err.message });
    }
});
// ----------------------------
// PATCH turnover (Admin only)
// ----------------------------
router.patch("/:id", attachUser, requireRoles([Role.ADMIN]), async (req, res) => {
    const { id } = req.params;
    const { date, total_sales_cents, total_refunds_cents, net_turnover_cents } = req.body;
    // Validate input
    const errors = [];
    if (date !== undefined && !(date instanceof Date) && typeof date !== 'string') {
        errors.push("date must be a valid date");
    }
    if (total_sales_cents !== undefined && (typeof total_sales_cents !== 'number' || total_sales_cents < 0)) {
        errors.push("total_sales_cents must be a non-negative number");
    }
    if (total_refunds_cents !== undefined && (typeof total_refunds_cents !== 'number' || total_refunds_cents < 0)) {
        errors.push("total_refunds_cents must be a non-negative number");
    }
    if (net_turnover_cents !== undefined && typeof net_turnover_cents !== 'number') {
        errors.push("net_turnover_cents must be a number");
    }
    if (errors.length > 0) {
        return res.status(400).json({ success: false, error: "Validation failed", details: errors });
    }
    try {
        // Check if turnover exists
        const existingTurnover = await prisma.turnover.findUnique({ where: { id: Number(id) } });
        if (!existingTurnover) {
            return res.status(404).json({ success: false, error: `Turnover with id "${id}" not found` });
        }
        // Build update data object dynamically
        const updateData = {};
        if (date !== undefined)
            updateData.date = date ? new Date(date) : null;
        if (total_sales_cents !== undefined)
            updateData.total_sales_cents = total_sales_cents;
        if (total_refunds_cents !== undefined)
            updateData.total_refunds_cents = total_refunds_cents;
        if (net_turnover_cents !== undefined)
            updateData.net_turnover_cents = net_turnover_cents;
        const updatedTurnover = await prisma.turnover.update({
            where: { id: Number(id) },
            data: updateData,
        });
        res.json({ success: true, data: updatedTurnover });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Error updating turnover", details: err.message });
    }
});
// ----------------------------
// DELETE turnover (Admin only)
// ----------------------------
router.delete("/:id", attachUser, requireRoles([Role.ADMIN]), async (req, res) => {
    const { id } = req.params;
    try {
        // Check if turnover exists
        const existingTurnover = await prisma.turnover.findUnique({ where: { id: Number(id) } });
        if (!existingTurnover) {
            return res.status(404).json({ success: false, error: `Turnover with id "${id}" not found` });
        }
        // Delete the turnover
        await prisma.turnover.delete({ where: { id: Number(id) } });
        res.json({ success: true, data: null });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Error deleting turnover", details: err.message });
    }
});
export default router;
//# sourceMappingURL=turnOver.js.map