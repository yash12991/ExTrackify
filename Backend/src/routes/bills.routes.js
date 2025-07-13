import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  createBill,
  getUserBills,
  getBillById,
  updateBill,
  deleteBill,
  markBillAsPaid,
  getBillsSummary,
  getBillsByCategory,
  getMonthlyBillsTotal,
} from "../controllers/bills.controller.js";

const router = Router();

// Apply JWT verification to all routes
router.use(verifyJWT);

// Bills CRUD operations
router.post("/", createBill); // Create a new bill
router.get("/", getUserBills); // Get all bills for user with filters and pagination
router.get("/summary", getBillsSummary); // Get bills summary
router.get("/category", getBillsByCategory); // Get bills grouped by category
router.get("/monthly-total", getMonthlyBillsTotal); // Get monthly bills total
router.get("/:id", getBillById); // Get specific bill by ID
router.put("/:id", updateBill); // Update bill
router.delete("/:id", deleteBill); // Delete bill
router.patch("/:id/pay", markBillAsPaid); // Mark bill as paid

export default router;
