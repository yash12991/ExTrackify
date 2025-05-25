import { SIP } from "../models/SIP.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import mongoose from "mongoose";
import { calculateFutureValue } from "../utils/sip.Calculator.js";
import { Payment } from "../models/Payment.models.js";
// Create a new SIP

const createSIP = asyncHandler(async (req, res) => {
  const {
    sipName,
    amount,
    startDate,
    durationInMonths,
    frequency,
    goal,
    notes,
  } = req.body;
  if (!sipName || !amount) {
    throw new ApiError(400, "Sip name and amount are required");
  }

  const sip = await SIP.create({
    sipName,
    amount,
    startDate,
    durationInMonths,
    frequency,
    goal,
    notes,
    user: req.user._id,
    nextPaymentDate: startDate || new Date(),
  });
  res.status(201).json(new ApiResponse(201, sip, "Sip created succesfully"));
});

const getAllSIPs = asyncHandler(async (req, res) => {
  const sips = await SIP.find({ user: req.user._id }).sort({ createdAt: -1 });
  res
    .status(200)
    .json(new ApiResponse(200, sips, "All SIPs fetched successfully"));
});

const getSIPById = asyncHandler(async (req, res) => {
  const sip = await SIP.findOne({ _id: req.params.id, user: req.user._id });
  if (!sip) throw new ApiError(404, "SIP not found");
  res.status(200).json(new ApiResponse(200, sip, "SIP fetched successfully"));
});

const updateSIP = asyncHandler(async (req, res) => {
  const sip = await SIP.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!sip) throw new ApiError(404, "SIP not found");
  res.status(200).json(new ApiResponse(200, sip, "SIP updated"));
});

const deleteSIP = asyncHandler(async (req, res) => {
  const sip = await SIP.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!sip) throw new ApiError(404, "SIP not found");
  res.status(200).json(new ApiResponse(200, {}, "SIP deleted"));
});

const getActiveSIPs = asyncHandler(async (req, res) => {
  const sips = await SIP.find({ user: req.user._id, isActive: true });
  res.status(200).json(new ApiResponse(200, sips, "Active SIPs fetched"));
});

const getSIPProjection = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rate = 12 } = req.query;

  const sip = await SIP.findOne({ _id: id, user: req.user._id });
  if (!sip) throw new ApiError(404, "SIP not found");

  const futureValue = calculateFutureValue(
    sip.amount,
    parseFloat(rate),
    sip.durationInMonths
  );

  res.status(200).json(
    new ApiResponse(
      200,
      {
        projectedValue: futureValue.toFixed(2),
        totalInvested: sip.amount * sip.durationInMonths,
      },
      "Projection calculated"
    )
  );
});

const getSIPChartData = asyncHandler(async (req, res) => {
  const sips = await SIP.find({ user: req.user._id });
  // Optionally, you can fetch payments if you want to show actual paid amounts

  // For simplicity, let's aggregate all SIPs by month for the chart
  const months = [];
  const investedData = [];
  const returnsData = [];

  // Find the max duration among all SIPs
  const maxMonths = sips.reduce(
    (max, sip) => Math.max(max, sip.durationInMonths),
    0
  );

  // Generate month labels
  for (let i = 1; i <= maxMonths; i++) {
    months.push(`Month ${i}`);
    let invested = 0;
    let returns = 0;
    sips.forEach((sip) => {
      if (i <= sip.durationInMonths) {
        invested += sip.amount;
        // Simple returns calculation (not compounding, just for demo)
        // You can replace this with your actual logic
        returns += sip.amount * 0.01 * i; // e.g., 1% per month
      }
    });
    investedData.push(invested);
    returnsData.push(returns);
  }

  const chartData = {
    labels: months,
    datasets: [
      {
        label: "Invested Amount",
        data: investedData,
      },
      {
        label: "Returns",
        data: returnsData,
      },
    ],
  };

  res.status(200).json({ success: true, data: chartData });
});

export {
  createSIP,
  getAllSIPs,
  getSIPById,
  updateSIP,
  deleteSIP,
  getActiveSIPs,
  getSIPProjection,
  getSIPChartData,
};
