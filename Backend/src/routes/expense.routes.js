import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  deleteExpense,
  getExpenseSummary,
  getUserExpenses,
  SetExpense,
  updateExpense,getCategoryWiseSummary,
    getLast7DaysSummary,
    getLast6MonthsSummary,
} from "../controllers/expense.controllers.js";

const router = Router();

router.get("/", verifyJWT, getUserExpenses); // Get all expenses for user
router.post("/", verifyJWT, SetExpense); // Add new expense
router.get("/summary", verifyJWT, getExpenseSummary); // Get expense summary
router.put("/:id", verifyJWT, updateExpense); // Update expense
router.delete("/:id", verifyJWT, deleteExpense); // Delete expense
router.get("/chart/category-summary", verifyJWT, getCategoryWiseSummary);
router.get("/chart/weekly-summary", verifyJWT, getLast7DaysSummary);
router.get("/chart/monthly-summary",verifyJWT, getLast6MonthsSummary);
export default router; 


