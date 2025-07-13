import { SIP } from "../models/SIP.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import mongoose from "mongoose";
import {
  calculateFutureValue,
  calculateNextPaymentDate,
  calculateSIPMaturityValue,
} from "../utils/sip.Calculator.js";
import { Payment } from "../models/Payment.models.js";
import { sendEmail, createSIPEmailTemplate } from "../utils/nodemailer.js";
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
    expectedRate = 12,
  } = req.body;

  if (!sipName || !amount) {
    throw new ApiError(400, "SIP name and amount are required");
  }

  if (!expectedRate || expectedRate < 0 || expectedRate > 50) {
    throw new ApiError(
      400,
      "Expected rate of return must be between 0% and 50%"
    );
  }

  const sipStartDate = startDate ? new Date(startDate) : new Date();

  // Calculate next payment date based on start date and frequency
  const nextPaymentDate = calculateNextPaymentDate(sipStartDate, frequency);

  // Calculate expected maturity value
  const expectedMaturityValue = calculateSIPMaturityValue(
    amount,
    expectedRate,
    durationInMonths,
    frequency
  );

  const sip = await SIP.create({
    sipName,
    amount,
    startDate: sipStartDate,
    durationInMonths,
    frequency,
    goal,
    notes,
    expectedRate,
    expectedMaturityValue,
    user: req.user._id,
    nextPaymentDate,
  });

  // Send email notification
  try {
    console.log("📧 Attempting to send SIP creation email...");
    console.log("User email:", req.user.email);
    console.log("User name:", req.user.fullname || req.user.username);

    const emailHTML = createSIPEmailTemplate(req.user, {
      sipName,
      amount,
      startDate: sipStartDate,
      durationInMonths,
      frequency,
      goal,
      expectedRate,
      expectedMaturityValue,
      nextPaymentDate,
    });

    await sendEmail(
      req.user.email,
      "🎉 SIP Created Successfully - Your Investment Journey Begins!",
      `Your SIP "${sipName}" has been created successfully with an investment of ₹${amount.toLocaleString(
        "en-IN"
      )} ${frequency}.`,
      emailHTML
    );

    console.log(`✅ SIP creation email sent successfully to ${req.user.email}`);
  } catch (emailError) {
    console.error("❌ Failed to send SIP creation email:", emailError);
    // Don't fail the SIP creation if email fails
  }

  res.status(201).json(new ApiResponse(201, sip, "SIP created successfully"));
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
  const updateData = { ...req.body };

  // If critical fields are updated, recalculate dependent values
  if (
    updateData.amount ||
    updateData.expectedRate ||
    updateData.durationInMonths ||
    updateData.frequency
  ) {
    const existingSIP = await SIP.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!existingSIP) throw new ApiError(404, "SIP not found");

    const amount = updateData.amount || existingSIP.amount;
    const expectedRate = updateData.expectedRate || existingSIP.expectedRate;
    const durationInMonths =
      updateData.durationInMonths || existingSIP.durationInMonths;
    const frequency = updateData.frequency || existingSIP.frequency;

    // Recalculate expected maturity value
    updateData.expectedMaturityValue = calculateSIPMaturityValue(
      amount,
      expectedRate,
      durationInMonths,
      frequency
    );
  }

  // If start date or frequency is updated, recalculate next payment date
  if (updateData.startDate || updateData.frequency) {
    const existingSIP = await SIP.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!existingSIP) throw new ApiError(404, "SIP not found");

    const startDate = updateData.startDate || existingSIP.startDate;
    const frequency = updateData.frequency || existingSIP.frequency;

    updateData.nextPaymentDate = calculateNextPaymentDate(startDate, frequency);
  }

  const sip = await SIP.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    updateData,
    { new: true, runValidators: true }
  );

  if (!sip) throw new ApiError(404, "SIP not found");
  res.status(200).json(new ApiResponse(200, sip, "SIP updated successfully"));
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
  const { rate } = req.query;

  const sip = await SIP.findOne({ _id: id, user: req.user._id });
  if (!sip) throw new ApiError(404, "SIP not found");

  // Use provided rate or fallback to SIP's expected rate or default 12%
  const projectionRate = rate ? parseFloat(rate) : sip.expectedRate || 12;

  const futureValue = calculateSIPMaturityValue(
    sip.amount,
    projectionRate,
    sip.durationInMonths,
    sip.frequency
  );

  const totalPayments =
    sip.frequency === "monthly"
      ? sip.durationInMonths
      : sip.frequency === "quarterly"
      ? Math.ceil(sip.durationInMonths / 3)
      : Math.ceil(sip.durationInMonths / 12);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        projectedValue: futureValue.toFixed(2),
        totalInvested: (sip.amount * totalPayments).toFixed(2),
        totalGain: (futureValue - sip.amount * totalPayments).toFixed(2),
        rateUsed: projectionRate,
        frequency: sip.frequency,
        totalPayments,
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

const getSIPAnalytics = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const sip = await SIP.findOne({ _id: id, user: req.user._id });
  if (!sip) throw new ApiError(404, "SIP not found");

  // Get all payments for this SIP
  const payments = await Payment.find({
    sip: id,
    user: req.user._id,
  }).sort({ paymentDate: -1 });

  // Calculate analytics
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalExpected = sip.amount * sip.durationInMonths;
  const completionPercentage = ((totalPaid / totalExpected) * 100).toFixed(2);

  // Calculate missed payments
  const currentDate = new Date();
  const startDate = new Date(sip.startDate);
  const monthsPassed = Math.floor(
    (currentDate - startDate) / (1000 * 60 * 60 * 24 * 30)
  );
  const expectedPayments = Math.min(monthsPassed + 1, sip.durationInMonths);
  const missedPayments = expectedPayments - payments.length;

  // Generate projection
  const futureValue = calculateFutureValue(
    sip.amount,
    12,
    sip.durationInMonths
  );

  // Next payment info
  const nextPaymentDue = new Date(sip.nextPaymentDate);
  const daysUntilNext = Math.ceil(
    (nextPaymentDue - currentDate) / (1000 * 60 * 60 * 24)
  );

  const analytics = {
    sipDetails: sip,
    payments: payments,
    totalPaid,
    totalExpected,
    completionPercentage: parseFloat(completionPercentage),
    remainingAmount: totalExpected - totalPaid,
    missedPayments: Math.max(0, missedPayments),
    projectedReturns: futureValue,
    nextPaymentDue: nextPaymentDue,
    daysUntilNextPayment: daysUntilNext,
    monthlyProgress: generateMonthlyProgress(sip, payments),
    performanceMetrics: {
      consistency: ((payments.length / expectedPayments) * 100).toFixed(2),
      avgPaymentAmount:
        payments.length > 0 ? (totalPaid / payments.length).toFixed(2) : 0,
      timeRemaining: sip.durationInMonths - monthsPassed,
    },
  };

  res
    .status(200)
    .json(
      new ApiResponse(200, analytics, "SIP analytics fetched successfully")
    );
});

const getSIPSummary = asyncHandler(async (req, res) => {
  const sips = await SIP.find({ user: req.user._id });
  const allPayments = await Payment.find({ user: req.user._id });

  const summary = {
    totalSIPs: sips.length,
    activeSIPs: sips.filter((sip) => sip.isActive).length,
    totalInvestment: sips.reduce(
      (sum, sip) => sum + sip.amount * sip.durationInMonths,
      0
    ),
    totalPaid: allPayments.reduce((sum, payment) => sum + payment.amount, 0),
    monthlyCommitment: sips
      .filter((sip) => sip.isActive)
      .reduce((sum, sip) => sum + sip.amount, 0),
    upcomingPayments: await getUpcomingPayments(req.user._id),
    recentActivity: allPayments
      .slice(0, 5)
      .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate)),
  };

  res
    .status(200)
    .json(new ApiResponse(200, summary, "SIP summary fetched successfully"));
});

// Helper function to generate monthly progress
const generateMonthlyProgress = (sip, payments) => {
  const progress = [];
  const startDate = new Date(sip.startDate);

  for (let i = 0; i < sip.durationInMonths; i++) {
    const monthDate = new Date(startDate);
    monthDate.setMonth(monthDate.getMonth() + i);

    const payment = payments.find((p) => {
      const paymentDate = new Date(p.paymentDate);
      return (
        paymentDate.getMonth() === monthDate.getMonth() &&
        paymentDate.getFullYear() === monthDate.getFullYear()
      );
    });

    progress.push({
      month: i + 1,
      date: monthDate,
      paid: payment ? payment.amount : 0,
      expected: sip.amount,
      status: payment ? "paid" : monthDate <= new Date() ? "missed" : "pending",
    });
  }

  return progress;
};

// Helper function to get upcoming payments
const getUpcomingPayments = async (userId) => {
  const activeSIPs = await SIP.find({ user: userId, isActive: true });
  const upcoming = [];

  activeSIPs.forEach((sip) => {
    const nextPayment = new Date(sip.nextPaymentDate);
    const daysUntil = Math.ceil(
      (nextPayment - new Date()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntil <= 30) {
      upcoming.push({
        sipId: sip._id,
        sipName: sip.sipName,
        amount: sip.amount,
        dueDate: nextPayment,
        daysUntil,
      });
    }
  });

  return upcoming.sort((a, b) => a.daysUntil - b.daysUntil);
};

const getUpcomingPaymentsDashboard = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  const activeSIPs = await SIP.find({ user: req.user._id, isActive: true });
  const upcoming = [];

  activeSIPs.forEach((sip) => {
    const nextPayment = new Date(sip.nextPaymentDate);
    const daysUntil = Math.ceil(
      (nextPayment - new Date()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntil <= parseInt(days) && daysUntil >= 0) {
      upcoming.push({
        sipId: sip._id,
        sipName: sip.sipName,
        amount: sip.amount,
        frequency: sip.frequency,
        dueDate: nextPayment,
        daysUntil,
        isOverdue: daysUntil < 0,
        expectedMaturityValue: sip.expectedMaturityValue,
        expectedRate: sip.expectedRate,
      });
    }
  });

  const sortedUpcoming = upcoming.sort((a, b) => a.daysUntil - b.daysUntil);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        sortedUpcoming,
        "Upcoming payments fetched successfully"
      )
    );
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
  getSIPAnalytics,
  getSIPSummary,
  getUpcomingPaymentsDashboard,
};
