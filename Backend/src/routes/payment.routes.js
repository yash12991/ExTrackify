import express from "express";
import {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
} from "../controllers/Payment.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

// Create a new payment
router.post("/", verifyJWT, createPayment);

// Get all payments for the logged-in user
router.get("/", verifyJWT, getAllPayments);

// Get a single payment by ID
router.get("/:id", verifyJWT, getPaymentById);

// Update a payment
router.put("/:id", verifyJWT, updatePayment);

// Delete a payment
router.delete("/:id", verifyJWT, deletePayment);

export default router;
