import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { attachUser } from "../middleware/auth.js";
import { Role } from "../middleware/roles.js";
import { requireRoles } from "../middleware/rbac.js";
const prisma = new PrismaClient();
const router = Router();
// ----------------------------
// GET all daily sales summaries (Admin only)
// ----------------------------
router.get("/", attachUser, requireRoles([Role.ADMIN]), async (req, res) => {
    try {
        const dailySalesSummaries = await prisma.dailySalesSummary.findMany({
            orderBy: { created_at: "desc" }
        });
        res.json({ success: true, data: dailySalesSummaries });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Error fetching daily sales summaries", details: err.message });
    }
});
// ----------------------------
// GET daily sales summary by ID (Admin only)
// ----------------------------
router.get("/:id", attachUser, requireRoles([Role.ADMIN]), async (req, res) => {
    const { id } = req.params;
    try {
        const dailySalesSummary = await prisma.dailySalesSummary.findUnique({ where: { id: Number(id) } });
        if (!dailySalesSummary) {
            return res.status(404).json({ success: false, error: `Daily sales summary with id "${id}" not found` });
        }
        res.json({ success: true, data: dailySalesSummary });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Error fetching daily sales summary", details: err.message });
    }
});
// ----------------------------
// CREATE daily sales summary (Admin only)
// ----------------------------
router.post("/", attachUser, requireRoles([Role.ADMIN]), async (req, res) => {
    const { date, total_sales_euro } = req.body;
    // Validate input
    const errors = [];
    if (date !== undefined && !(date instanceof Date) && typeof date !== 'string') {
        errors.push("date must be a valid date");
    }
    if (total_sales_euro !== undefined && typeof total_sales_euro !== 'number') {
        errors.push("total_sales_euro must be a number");
    }
    if (errors.length > 0) {
        return res.status(400).json({ success: false, error: "Validation failed", details: errors });
    }
    try {
        // Build create data object dynamically to avoid TypeScript issues
        const createData = {};
        if (date !== undefined)
            createData.date = date ? new Date(date) : null;
        if (total_sales_euro !== undefined)
            createData.total_sales_euro = total_sales_euro;
        const newDailySalesSummary = await prisma.dailySalesSummary.create({
            data: createData,
        });
        res.status(201).json({ success: true, data: newDailySalesSummary });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Error creating daily sales summary", details: err.message });
    }
});
// ----------------------------
// PATCH daily sales summary (Admin only)
// ----------------------------
router.patch("/:id", attachUser, requireRoles([Role.ADMIN]), async (req, res) => {
    const { id } = req.params;
    const { date, total_sales_euro } = req.body;
    // Validate input
    const errors = [];
    if (date !== undefined && !(date instanceof Date) && typeof date !== 'string') {
        errors.push("date must be a valid date");
    }
    if (total_sales_euro !== undefined && typeof total_sales_euro !== 'number') {
        errors.push("total_sales_euro must be a number");
    }
    if (errors.length > 0) {
        return res.status(400).json({ success: false, error: "Validation failed", details: errors });
    }
    try {
        // Check if daily sales summary exists
        const existingDailySalesSummary = await prisma.dailySalesSummary.findUnique({ where: { id: Number(id) } });
        if (!existingDailySalesSummary) {
            return res.status(404).json({ success: false, error: `Daily sales summary with id "${id}" not found` });
        }
        // Build update data object dynamically to avoid TypeScript issues
        const updateData = {};
        if (date !== undefined)
            updateData.date = date ? new Date(date) : null;
        if (total_sales_euro !== undefined)
            updateData.total_sales_euro = total_sales_euro;
        const updatedDailySalesSummary = await prisma.dailySalesSummary.update({
            where: { id: Number(id) },
            data: updateData,
        });
        res.json({ success: true, data: updatedDailySalesSummary });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Error updating daily sales summary", details: err.message });
    }
});
// ----------------------------
// DELETE daily sales summary (Admin only)
// ----------------------------
router.delete("/:id", attachUser, requireRoles([Role.ADMIN]), async (req, res) => {
    const { id } = req.params;
    try {
        // Check if daily sales summary exists
        const existingDailySalesSummary = await prisma.dailySalesSummary.findUnique({ where: { id: Number(id) } });
        if (!existingDailySalesSummary) {
            return res.status(404).json({ success: false, error: `Daily sales summary with id "${id}" not found` });
        }
        // Delete the daily sales summary
        await prisma.dailySalesSummary.delete({ where: { id: Number(id) } });
        res.json({ success: true, data: null });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Error deleting daily sales summary", details: err.message });
    }
});
export default router;
//# sourceMappingURL=dailySalesSummary.js.map