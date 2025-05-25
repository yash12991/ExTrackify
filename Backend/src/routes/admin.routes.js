import express from "express";
import { getAdminDashboardData } from "../controllers/adminController.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

// Admin dashboard data (protect with verifyJWT or your admin middleware)
router.get("/dashboard", verifyJWT, getAdminDashboardData);

export default router;