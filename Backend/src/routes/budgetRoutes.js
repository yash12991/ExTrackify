import express from "express";
import {
  setOrUpdateBudget,
  getBudget,
  getBudgetStatus,
} from "../controllers/budget.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", verifyJWT, setOrUpdateBudget);
router.get("/", verifyJWT, getBudget);
router.get("/status", verifyJWT, getBudgetStatus);

export default router;
