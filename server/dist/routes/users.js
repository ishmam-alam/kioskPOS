import { Router } from "express";
import {} from "@prisma/client";
import { attachUser, generateToken } from "../middleware/auth.js";
import { Role } from "../middleware/roles.js";
import { requireRoles } from "../middleware/rbac.js";
import { createUserSchema, updateUserSchema, loginSchema, validateRequest, validateParams, idParamSchema } from "../middleware/validation.js";
import { logger } from "../middleware/logger.js";
import prisma from "../lib/database.js";
const router = Router();
// ----------------------------
// GET all users
// ----------------------------
router.get("/", attachUser, requireRoles([Role.ADMIN, Role.OWNER, Role.MANAGER]), async (req, res) => {
    try {
        const users = await prisma.user.findMany({ orderBy: { created_at: "desc" } });
        const requestingRole = req.user?.role;
        const data = users
            .map((u) => {
            if (requestingRole === Role.MANAGER) {
                if (!u.active)
                    return null;
                return { user_id: u.user_id, name: u.name, role: u.role };
            }
            if (requestingRole === Role.OWNER) {
                const { pin, ...rest } = u;
                return rest;
            }
            return u; // Admin sees everything
        })
            .filter((user) => user !== null);
        res.json({ success: true, data });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Error fetching users", details: err.message });
    }
});
// ----------------------------
// GET user by user_id
// ----------------------------
router.get("/:user_id", attachUser, async (req, res) => {
    const { user_id } = req.params;
    const requestingUser = req.user;
    try {
        const user = await prisma.user.findUnique({ where: { user_id: Number(user_id) } });
        if (!user)
            return res.status(404).json({ success: false, error: `User with user_id "${user_id}" not found` });
        // Self access
        if (requestingUser?.userId === Number(user_id))
            return res.json({ success: true, data: user });
        if (!requestingUser || [Role.VISITOR, Role.EMPLOYEE].includes(requestingUser.role)) {
            return res.status(403).json({ success: false, error: "Insufficient privileges" });
        }
        let masked = user;
        if (requestingUser.role === Role.MANAGER && !user.active) {
            return res.status(404).json({ success: false, error: `User with user_id "${user_id}" not found` });
        }
        if (requestingUser.role === Role.MANAGER) {
            masked = { user_id: user.user_id, name: user.name, role: user.role };
        }
        if (requestingUser.role === Role.OWNER) {
            const { pin, ...rest } = user;
            masked = rest;
        }
        res.json({ success: true, data: masked });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Error fetching user", details: err.message });
    }
});
// ----------------------------
// CREATE user
// ----------------------------
router.post("/", attachUser, requireRoles([Role.ADMIN, Role.OWNER, Role.MANAGER]), validateRequest(createUserSchema), async (req, res) => {
    try {
        const { user_id, pin, name, role, active } = req.body;
        const newUser = await prisma.user.create({
            data: {
                user_id,
                pin,
                name: name?.trim() || "",
                role,
                active
            },
        });
        logger.info(`User created: ${user_id}`, { userId: user_id, role });
        res.json({ success: true, data: newUser });
    }
    catch (err) {
        logger.error("Error creating user", err);
        const errorMsg = err.code === "P2002" ? `user_id ${req.body.user_id} already exists` : "Error creating user";
        res.status(500).json({ success: false, error: errorMsg, details: err.message });
    }
});
// ----------------------------
// PATCH user
// ----------------------------
router.patch("/:user_id", attachUser, validateParams(idParamSchema, "user_id"), validateRequest(updateUserSchema), async (req, res) => {
    const user_id = req.validatedParams.user_id;
    const requestingUser = req.user;
    const { pin, name, role, active } = req.body;
    if (!requestingUser)
        return res.status(401).json({ success: false, error: "Authentication required" });
    const isSelf = requestingUser.userId === user_id;
    const isAdmin = requestingUser.role === Role.ADMIN;
    const isOwner = requestingUser.role === Role.OWNER;
    const isManager = requestingUser.role === Role.MANAGER;
    let allowedFields = {};
    if (isAdmin) {
        if (pin !== undefined)
            allowedFields.pin = pin;
        if (name !== undefined)
            allowedFields.name = name.trim();
        if (role !== undefined)
            allowedFields.role = role;
        if (active !== undefined)
            allowedFields.active = active;
    }
    else if (isSelf) {
        if (pin !== undefined)
            allowedFields.pin = pin;
        if (name !== undefined)
            allowedFields.name = name.trim();
    }
    else if (isOwner || isManager) {
        if (name !== undefined)
            allowedFields.name = name.trim();
        if (role !== undefined)
            allowedFields.role = role;
        if (active !== undefined)
            allowedFields.active = active;
    }
    else {
        return res.status(403).json({ success: false, error: "Insufficient privileges" });
    }
    try {
        const updatedUser = await prisma.user.update({
            where: { user_id },
            data: allowedFields,
        });
        logger.info(`User updated: ${user_id}`, { userId: user_id, updatedFields: Object.keys(allowedFields) });
        res.json({ success: true, data: updatedUser });
    }
    catch (err) {
        logger.error("Error updating user", err);
        res.status(500).json({ success: false, error: "Error updating user", details: err.message });
    }
});
// ----------------------------
// DELETE user
// ----------------------------
router.delete("/:user_id", attachUser, requireRoles([Role.ADMIN, Role.OWNER]), validateParams(idParamSchema, "user_id"), async (req, res) => {
    const user_id = req.validatedParams.user_id;
    try {
        await prisma.user.delete({ where: { user_id } });
        logger.info(`User deleted: ${user_id}`, { userId: user_id });
        res.json({ success: true, data: null });
    }
    catch (err) {
        logger.error("Error deleting user", err);
        res.status(500).json({ success: false, error: "Error deleting user", details: err.message });
    }
});
// ----------------------------
// LOGIN endpoint
// ----------------------------
router.post("/login", validateRequest(loginSchema), async (req, res) => {
    const { user_id, pin } = req.body;
    try {
        // Find user by user_id
        const user = await prisma.user.findUnique({ where: { user_id } });
        if (!user) {
            logger.warn("Login attempt with non-existent user_id", { user_id });
            return res.status(401).json({ success: false, error: "User ID not found" });
        }
        // Check if user is active
        if (!user.active) {
            logger.warn("Login attempt with inactive account", { user_id });
            return res.status(401).json({ success: false, error: "User account is deactivated" });
        }
        // Verify PIN (in a real application, you would hash the PIN)
        if (user.pin !== pin) {
            logger.warn("Login attempt with wrong PIN", { user_id });
            return res.status(401).json({ success: false, error: "Wrong PIN" });
        }
        // Generate JWT token
        const token = generateToken(user.user_id, user.role);
        logger.info("User logged in successfully", { user_id, role: user.role });
        // Return token and user info
        res.json({ success: true, data: { token, user } });
    }
    catch (err) {
        logger.error("Error during login", err);
        res.status(500).json({ success: false, error: "Error during login", details: err.message });
    }
});
// ----------------------------
// GET current user (for token verification)
// ----------------------------
router.get("/me", attachUser, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ success: false, error: "Authentication required" });
    }
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: req.user.userId
            }
        });
        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }
        // Check if user is still active
        if (!user.active) {
            return res.status(401).json({ success: false, error: "User account is deactivated" });
        }
        // Remove PIN from response for security
        const { pin, ...userWithoutPin } = user;
        res.json({ success: true, data: userWithoutPin });
    }
    catch (err) {
        console.error('Error in /me endpoint:', err);
        res.status(500).json({ success: false, error: "Error fetching user", details: err.message });
    }
});
// ----------------------------
// WELCOME endpoint
// ----------------------------
router.get("/welcome", async (req, res) => {
    logger.info(`Request received: ${req.method} ${req.path}`);
    res.json({ success: true, data: { message: "Welcome to the API!" } });
});
export default router;
//# sourceMappingURL=users.js.map