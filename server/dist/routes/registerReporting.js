import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { attachUser } from "../middleware/auth.js";
import { Role } from "../middleware/roles.js";
import { requireRoles } from "../middleware/rbac.js";
const prisma = new PrismaClient();
const router = Router();
// ----------------------------
// GET all register reporting records (Admin only)
// ----------------------------
router.get("/", attachUser, requireRoles([Role.ADMIN]), async (req, res) => {
    try {
        const registerReportings = await prisma.registerReporting.findMany({
            orderBy: { reported_at: "desc" }
        });
        res.json({ success: true, data: registerReportings });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Error fetching register reporting records", details: err.message });
    }
});
// ----------------------------
// GET register reporting by ID (Admin only)
// ----------------------------
router.get("/:id", attachUser, requireRoles([Role.ADMIN]), async (req, res) => {
    const { id } = req.params;
    try {
        const registerReporting = await prisma.registerReporting.findUnique({ where: { id: Number(id) } });
        if (!registerReporting) {
            return res.status(404).json({ success: false, error: `Register reporting with id "${id}" not found` });
        }
        res.json({ success: true, data: registerReporting });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Error fetching register reporting", details: err.message });
    }
});
// ----------------------------
// CREATE register reporting (Admin only)
// ----------------------------
router.post("/", attachUser, requireRoles([Role.ADMIN]), async (req, res) => {
    const { tse_id, register_id, report_type, reported_at, status } = req.body;
    // Validate input
    const errors = [];
    if (tse_id !== undefined && typeof tse_id !== 'number') {
        errors.push("tse_id must be a number");
    }
    if (register_id !== undefined && typeof register_id !== 'number') {
        errors.push("register_id must be a number");
    }
    if (report_type !== undefined && typeof report_type !== 'string') {
        errors.push("report_type must be a string");
    }
    else if (report_type && report_type.length > 50) {
        errors.push("report_type must be less than 50 characters");
    }
    if (reported_at !== undefined && !(reported_at instanceof Date) && typeof reported_at !== 'string') {
        errors.push("reported_at must be a valid date");
    }
    if (status !== undefined && typeof status !== 'string') {
        errors.push("status must be a string");
    }
    else if (status && status.length > 50) {
        errors.push("status must be less than 50 characters");
    }
    if (errors.length > 0) {
        return res.status(400).json({ success: false, error: "Validation failed", details: errors });
    }
    try {
        const newRegisterReporting = await prisma.registerReporting.create({
            data: {
                tse_id: tse_id || null,
                register_id: register_id || null,
                report_type: report_type || null,
                reported_at: reported_at ? new Date(reported_at) : null,
                status: status || null
            },
        });
        res.status(201).json({ success: true, data: newRegisterReporting });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Error creating register reporting", details: err.message });
    }
});
// ----------------------------
// PATCH register reporting (Admin only)
// ----------------------------
router.patch("/:id", attachUser, requireRoles([Role.ADMIN]), async (req, res) => {
    const { id } = req.params;
    const { report_type, reported_at, status } = req.body;
    // Validate input
    const errors = [];
    if (report_type !== undefined && typeof report_type !== 'string') {
        errors.push("report_type must be a string");
    }
    else if (report_type && report_type.length > 50) {
        errors.push("report_type must be less than 50 characters");
    }
    if (reported_at !== undefined && !(reported_at instanceof Date) && typeof reported_at !== 'string') {
        errors.push("reported_at must be a valid date");
    }
    if (status !== undefined && typeof status !== 'string') {
        errors.push("status must be a string");
    }
    else if (status && status.length > 50) {
        errors.push("status must be less than 50 characters");
    }
    if (errors.length > 0) {
        return res.status(400).json({ success: false, error: "Validation failed", details: errors });
    }
    try {
        // Check if register reporting exists
        const existingRegisterReporting = await prisma.registerReporting.findUnique({ where: { id: Number(id) } });
        if (!existingRegisterReporting) {
            return res.status(404).json({ success: false, error: `Register reporting with id "${id}" not found` });
        }
        // Build update data object dynamically
        const updateData = {};
        if (report_type !== undefined)
            updateData.report_type = report_type;
        if (reported_at !== undefined)
            updateData.reported_at = reported_at ? new Date(reported_at) : null;
        if (status !== undefined)
            updateData.status = status;
        const updatedRegisterReporting = await prisma.registerReporting.update({
            where: { id: Number(id) },
            data: updateData,
        });
        res.json({ success: true, data: updatedRegisterReporting });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Error updating register reporting", details: err.message });
    }
});
// ----------------------------
// DELETE register reporting (Admin only)
// ----------------------------
router.delete("/:id", attachUser, requireRoles([Role.ADMIN]), async (req, res) => {
    const { id } = req.params;
    try {
        // Check if register reporting exists
        const existingRegisterReporting = await prisma.registerReporting.findUnique({ where: { id: Number(id) } });
        if (!existingRegisterReporting) {
            return res.status(404).json({ success: false, error: `Register reporting with id "${id}" not found` });
        }
        // Delete the register reporting
        await prisma.registerReporting.delete({ where: { id: Number(id) } });
        res.json({ success: true, data: null });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Error deleting register reporting", details: err.message });
    }
});
export default router;
//# sourceMappingURL=registerReporting.js.map