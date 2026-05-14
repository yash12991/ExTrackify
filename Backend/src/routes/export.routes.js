import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { exportExpenses, exportSIPs, exportBills } from "../controllers/export.controller.js";

const router = Router();
router.use(verifyJWT);

router.get("/expenses", exportExpenses);
router.get("/sips", exportSIPs);
router.get("/bills", exportBills);

export default router;
