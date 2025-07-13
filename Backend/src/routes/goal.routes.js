import express from "express";
import {
  estimateGoalCompletion,
  createGoal,
  getGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
  markGoalComplete,
  getGoalAnalytics,
} from "../controllers/goal.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

// Estimate goal completion
router.post("/estimate", verifyJWT, estimateGoalCompletion);

// CRUD operations
router.post("/", verifyJWT, createGoal);
router.get("/", verifyJWT, getGoals);
router.get("/analytics", verifyJWT, getGoalAnalytics);
router.get("/:id", verifyJWT, getGoalById);
router.put("/:id", verifyJWT, updateGoal);
router.delete("/:id", verifyJWT, deleteGoal);

// Mark as complete
router.patch("/:id/complete", verifyJWT, markGoalComplete);

export default router;
