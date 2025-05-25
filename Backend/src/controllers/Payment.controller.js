import { Payment } from "../models/Payment.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

// Create a new payment
export const createPayment = asyncHandler(async (req, res) => {
  const { sipId, amount, paymentDate, notes } = req.body;
  if (!sipId || !amount)
    throw new ApiError(400, "SIP ID and amount are required");

  const payment = await Payment.create({
    sip: sipId,
    amount,
    paymentDate: paymentDate || new Date(),
    notes,
    user: req.user._id,
  });

  res.status(201).json(new ApiResponse(201, payment, "Payment created"));
});

// Get all payments for the logged-in user
export const getAllPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ user: req.user._id }).sort({
    paymentDate: -1,
  });
  res.status(200).json(new ApiResponse(200, payments, "All payments fetched"));
});

// Get a single payment by ID
export const getPaymentById = asyncHandler(async (req, res) => {
  const payment = await Payment.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!payment) throw new ApiError(404, "Payment not found");
  res.status(200).json(new ApiResponse(200, payment, "Payment fetched"));
});

// Update a payment
export const updatePayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!payment) throw new ApiError(404, "Payment not found");
  res.status(200).json(new ApiResponse(200, payment, "Payment updated"));
});

// Delete a payment
export const deletePayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!payment) throw new ApiError(404, "Payment not found");
  res.status(200).json(new ApiResponse(200, {}, "Payment deleted"));
});
