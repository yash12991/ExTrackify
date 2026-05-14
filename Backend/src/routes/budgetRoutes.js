import express from "express";
import {
  setOrUpdateBudget,
  getBudget,
  getBudgetStatus,
  setOrUpdateOverallBudget,
  getOverAllBudget,
  checkBudgetAlerts,
} from "../controllers/budget.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", verifyJWT, setOrUpdateBudget);
router.get("/", verifyJWT, getBudget);
router.get("/status", verifyJWT, getBudgetStatus);
router.post("/overall", verifyJWT, setOrUpdateOverallBudget);
router.get("/overall", verifyJWT, getOverAllBudget);
router.get("/alerts", verifyJWT, checkBudgetAlerts);


export default router;
