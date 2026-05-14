import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { getSpendingAnalytics, getMonthlyComparison } from "../controllers/analytics.controller.js";

const router = Router();
router.use(verifyJWT);

router.get("/spending", getSpendingAnalytics);
router.get("/monthly-comparison", getMonthlyComparison);

export default router;
