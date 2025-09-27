import { Router } from "express";
import type { Request, Response } from "express";
import { PrismaClient, type TSEDevice } from "@prisma/client";
import type { ApiResponse } from "../types/ApiResponse.js";
import { attachUser } from "../middleware/auth.js";
import { Role } from "../middleware/roles.js";
import { requireRoles } from "../middleware/rbac.js";

const prisma = new PrismaClient();
const router = Router();

// Type definitions for TSE device requests and responses
type CreateTSEDeviceRequest = Omit<TSEDevice, 'id' | 'created_at'>;
type UpdateTSEDeviceRequest = Partial<Pick<TSEDevice, 'serial_number' | 'vendor' | 'cert_start' | 'cert_end'>>;

// ----------------------------
// GET all TSE devices (Admin only)
// ----------------------------
router.get(
  "/",
  attachUser,
  requireRoles([Role.ADMIN]),
  async (req: Request, res: Response<ApiResponse<TSEDevice[]>>) => {
    try {
      const tseDevices = await prisma.tSEDevice.findMany({
        orderBy: { created_at: "desc" }
      });
      res.json({ success: true, data: tseDevices });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ success: false, error: "Error fetching TSE devices", details: err.message });
    }
  }
);

// ----------------------------
// GET TSE device by ID (Admin only)
// ----------------------------
router.get("/:id", attachUser, requireRoles([Role.ADMIN]), async (req: Request<{ id: string }>, res: Response<ApiResponse<TSEDevice>>) => {
  const { id } = req.params;

  try {
    const tseDevice = await prisma.tSEDevice.findUnique({ where: { id: Number(id) } });
    if (!tseDevice) {
      return res.status(404).json({ success: false, error: `TSE device with id "${id}" not found` });
    }

    res.json({ success: true, data: tseDevice });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, error: "Error fetching TSE device", details: err.message });
  }
});

// ----------------------------
// CREATE TSE device (Admin only)
// ----------------------------
router.post(
  "/",
  attachUser,
  requireRoles([Role.ADMIN]),
  async (req: Request<{}, {}, CreateTSEDeviceRequest>, res: Response<ApiResponse<TSEDevice>>) => {
    const { serial_number, vendor, cert_start, cert_end } = req.body;

    // Validate input
    const errors: string[] = [];
    
    if (!serial_number) {
      errors.push("serial_number is required");
    } else if (serial_number.length > 100) {
      errors.push("serial_number must be less than 100 characters");
    }
    
    if (vendor !== undefined && typeof vendor !== 'string') {
      errors.push("vendor must be a string");
    } else if (vendor && vendor.length > 100) {
      errors.push("vendor must be less than 100 characters");
    }
    
    if (cert_start !== undefined && !(cert_start instanceof Date) && typeof cert_start !== 'string') {
      errors.push("cert_start must be a valid date");
    }
    
    if (cert_end !== undefined && !(cert_end instanceof Date) && typeof cert_end !== 'string') {
      errors.push("cert_end must be a valid date");
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, error: "Validation failed", details: errors });
    }

    try {
      // Check if serial_number already exists
      const existingTSEDevice = await prisma.tSEDevice.findUnique({ where: { serial_number } });
      if (existingTSEDevice) {
        return res.status(400).json({ success: false, error: `TSE device with serial_number "${serial_number}" already exists` });
      }

      const newTSEDevice = await prisma.tSEDevice.create({
        data: { 
          serial_number,
          vendor: vendor || null,
          cert_start: cert_start ? new Date(cert_start) : null,
          cert_end: cert_end ? new Date(cert_end) : null
        },
      });
      res.status(201).json({ success: true, data: newTSEDevice });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ success: false, error: "Error creating TSE device", details: err.message });
    }
  }
);

// ----------------------------
// PATCH TSE device (Admin only)
// ----------------------------
router.patch(
  "/:id",
  attachUser,
  requireRoles([Role.ADMIN]),
  async (req: Request<{ id: string }, {}, UpdateTSEDeviceRequest>, res: Response<ApiResponse<TSEDevice>>) => {
    const { id } = req.params;
    const { serial_number, vendor, cert_start, cert_end } = req.body;

    // Validate input
    const errors: string[] = [];
    
    if (serial_number !== undefined && serial_number.length > 100) {
      errors.push("serial_number must be less than 100 characters");
    }
    
    if (vendor !== undefined && typeof vendor !== 'string') {
      errors.push("vendor must be a string");
    } else if (vendor && vendor.length > 100) {
      errors.push("vendor must be less than 100 characters");
    }
    
    if (cert_start !== undefined && !(cert_start instanceof Date) && typeof cert_start !== 'string') {
      errors.push("cert_start must be a valid date");
    }
    
    if (cert_end !== undefined && !(cert_end instanceof Date) && typeof cert_end !== 'string') {
      errors.push("cert_end must be a valid date");
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, error: "Validation failed", details: errors });
    }

    try {
      // Check if TSE device exists
      const existingTSEDevice = await prisma.tSEDevice.findUnique({ where: { id: Number(id) } });
      if (!existingTSEDevice) {
        return res.status(404).json({ success: false, error: `TSE device with id "${id}" not found` });
      }

      // Check if serial_number already exists (if being updated)
      if (serial_number && serial_number !== existingTSEDevice.serial_number) {
        const duplicateTSEDevice = await prisma.tSEDevice.findUnique({ where: { serial_number } });
        if (duplicateTSEDevice) {
          return res.status(400).json({ success: false, error: `TSE device with serial_number "${serial_number}" already exists` });
        }
      }

      // Build update data object dynamically
      const updateData: any = {};
      if (serial_number !== undefined) updateData.serial_number = serial_number;
      if (vendor !== undefined) updateData.vendor = vendor;
      if (cert_start !== undefined) updateData.cert_start = cert_start ? new Date(cert_start) : null;
      if (cert_end !== undefined) updateData.cert_end = cert_end ? new Date(cert_end) : null;

      const updatedTSEDevice = await prisma.tSEDevice.update({
        where: { id: Number(id) },
        data: updateData,
      });
      res.json({ success: true, data: updatedTSEDevice });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ success: false, error: "Error updating TSE device", details: err.message });
    }
  }
);

// ----------------------------
// DELETE TSE device (Admin only)
// ----------------------------
router.delete(
  "/:id",
  attachUser,
  requireRoles([Role.ADMIN]),
  async (req: Request<{ id: string }>, res: Response<ApiResponse<null>>) => {
    const { id } = req.params;
    
    try {
      // Check if TSE device exists
      const existingTSEDevice = await prisma.tSEDevice.findUnique({ where: { id: Number(id) } });
      if (!existingTSEDevice) {
        return res.status(404).json({ success: false, error: `TSE device with id "${id}" not found` });
      }

      // Check if TSE device is used in any register reporting
      const registerReportingCount = await prisma.registerReporting.count({
        where: { tse_id: Number(id) }
      });

      if (registerReportingCount > 0) {
        return res.status(400).json({ 
          success: false, 
          error: "Cannot delete TSE device with associated register reporting",
          details: `TSE device has ${registerReportingCount} associated register reporting records`
        });
      }

      // Delete the TSE device
      await prisma.tSEDevice.delete({ where: { id: Number(id) } });
      res.json({ success: true, data: null });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ success: false, error: "Error deleting TSE device", details: err.message });
    }
  }
);

export default router;
