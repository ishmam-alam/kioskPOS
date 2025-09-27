import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { attachUser } from "../middleware/auth.js";
import { Role } from "../middleware/roles.js";
import { requireRoles } from "../middleware/rbac.js";
const prisma = new PrismaClient();
const router = Router();
// ----------------------------
// GET all registers (Admin only)
// ----------------------------
router.get("/", attachUser, requireRoles([Role.ADMIN]), async (req, res) => {
    try {
        const registers = await prisma.register.findMany({
            orderBy: { created_at: "desc" }
        });
        res.json({ success: true, data: registers });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Error fetching registers", details: err.message });
    }
});
// ----------------------------
// GET register by ID (Admin only)
// ----------------------------
router.get("/:id", attachUser, requireRoles([Role.ADMIN]), async (req, res) => {
    const { id } = req.params;
    try {
        const register = await prisma.register.findUnique({ where: { id: Number(id) } });
        if (!register) {
            return res.status(404).json({ success: false, error: `Register with id "${id}" not found` });
        }
        res.json({ success: true, data: register });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Error fetching register", details: err.message });
    }
});
// ----------------------------
// CREATE register (Admin only)
// ----------------------------
router.post("/", attachUser, requireRoles([Role.ADMIN]), async (req, res) => {
    const { register_number, name, location } = req.body;
    // Validate input
    const errors = [];
    if (register_number === undefined) {
        errors.push("register_number is required");
    }
    else if (typeof register_number !== 'number') {
        errors.push("register_number must be a number");
    }
    if (name !== undefined && typeof name !== 'string') {
        errors.push("name must be a string");
    }
    else if (name && name.length > 100) {
        errors.push("name must be less than 100 characters");
    }
    if (location !== undefined && typeof location !== 'string') {
        errors.push("location must be a string");
    }
    else if (location && location.length > 100) {
        errors.push("location must be less than 100 characters");
    }
    if (errors.length > 0) {
        return res.status(400).json({ success: false, error: "Validation failed", details: errors });
    }
    try {
        const newRegister = await prisma.register.create({
            data: {
                register_number,
                name: name || null,
                location: location || null
            },
        });
        res.status(201).json({ success: true, data: newRegister });
    }
    catch (err) {
        console.error(err);
        const errorMsg = err.code === "P2002" ? `Register with register_number "${register_number}" already exists` : "Error creating register";
        res.status(500).json({ success: false, error: errorMsg, details: err.message });
    }
});
// ----------------------------
// PATCH register (Admin only)
// ----------------------------
router.patch("/:id", attachUser, requireRoles([Role.ADMIN]), async (req, res) => {
    const { id } = req.params;
    const { register_number, name, location } = req.body;
    // Validate input
    const errors = [];
    if (register_number !== undefined && typeof register_number !== 'number') {
        errors.push("register_number must be a number");
    }
    if (name !== undefined && typeof name !== 'string') {
        errors.push("name must be a string");
    }
    else if (name && name.length > 100) {
        errors.push("name must be less than 100 characters");
    }
    if (location !== undefined && typeof location !== 'string') {
        errors.push("location must be a string");
    }
    else if (location && location.length > 100) {
        errors.push("location must be less than 100 characters");
    }
    if (errors.length > 0) {
        return res.status(400).json({ success: false, error: "Validation failed", details: errors });
    }
    try {
        // Check if register exists
        const existingRegister = await prisma.register.findUnique({ where: { id: Number(id) } });
        if (!existingRegister) {
            return res.status(404).json({ success: false, error: `Register with id "${id}" not found` });
        }
        // Build update data object dynamically
        const updateData = {};
        if (register_number !== undefined)
            updateData.register_number = register_number;
        if (name !== undefined)
            updateData.name = name || null;
        if (location !== undefined)
            updateData.location = location || null;
        const updatedRegister = await prisma.register.update({
            where: { id: Number(id) },
            data: updateData,
        });
        res.json({ success: true, data: updatedRegister });
    }
    catch (err) {
        console.error(err);
        const errorMsg = err.code === "P2002" ? `Register with this register_number already exists` : "Error updating register";
        res.status(500).json({ success: false, error: errorMsg, details: err.message });
    }
});
// ----------------------------
// DELETE register (Admin only)
// ----------------------------
router.delete("/:id", attachUser, requireRoles([Role.ADMIN]), async (req, res) => {
    const { id } = req.params;
    try {
        // Check if register exists
        const existingRegister = await prisma.register.findUnique({ where: { id: Number(id) } });
        if (!existingRegister) {
            return res.status(404).json({ success: false, error: `Register with id "${id}" not found` });
        }
        // Check if register is used in any sales
        const salesCount = await prisma.sale.count({
            where: { register_id: Number(id) }
        });
        if (salesCount > 0) {
            return res.status(400).json({
                success: false,
                error: "Cannot delete register with associated sales",
                details: `Register has ${salesCount} associated sales`
            });
        }
        // Check if register is used in any cancellations
        const cancellationsCount = await prisma.cancellation.count({
            where: { register_id: Number(id) }
        });
        if (cancellationsCount > 0) {
            return res.status(400).json({
                success: false,
                error: "Cannot delete register with associated cancellations",
                details: `Register has ${cancellationsCount} associated cancellations`
            });
        }
        // If no associated records, delete the register
        await prisma.register.delete({ where: { id: Number(id) } });
        res.json({ success: true, data: null });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Error deleting register", details: err.message });
    }
});
export default router;
//# sourceMappingURL=registers.js.map