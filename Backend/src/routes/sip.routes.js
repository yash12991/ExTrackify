import express from "express";
import {
  createSIP,
  getAllSIPs,
  getSIPById,
  updateSIP,
  deleteSIP,
  getActiveSIPs,
  getSIPProjection,
  getSIPChartData,
} from "../controllers/SIP.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

// Create a new SIP
router.post("/", verifyJWT, createSIP);

// Get all SIPs for the logged-in user
router.get("/", verifyJWT, getAllSIPs);

// Get all active SIPs
router.get("/active", verifyJWT, getActiveSIPs);

// Get SIP chart data (for graphs)
router.get("/chart", verifyJWT, getSIPChartData);

// Get a single SIP by ID
router.get("/:id", verifyJWT, getSIPById);

// Update a SIP
router.put("/:id", verifyJWT, updateSIP);

// Delete a SIP
router.delete("/:id", verifyJWT, deleteSIP);

// Get SIP projection (future value)
router.get("/:id/projection", verifyJWT, getSIPProjection);

export default router;
