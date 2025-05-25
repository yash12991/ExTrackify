import { Expense } from "../models/Expense.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { getDateRange } from "../utils/days.js";
import { addFrequency } from "../cronJobs/cronJobs.js"; // <-- Import the helper

// Utility function to get date range
// const getDateRange = (period) => {
//   const now = new Date();
//   let start;

//   if (period === "daily") {
//     start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//   } else if (period === "weekly") {
//     const day = now.getDay(); // 0 (Sun) - 6 (Sat)
//     start = new Date(now);
//     start.setDate(now.getDate() - day);
//     start.setHours(0, 0, 0, 0);
//   } else if (period === "monthly") {
//     start = new Date(now.getFullYear(), now.getMonth(), 1);
//   } else {
//     throw new Error("Invalid period");
//   }

//   return { start, end: now };
// };

// GET /api/expenses/summary?period=daily|weekly|monthly
const getExpenseSummary = asyncHandler(async (req, res) => {
  const period = req.query.period || "monthly"; // default monthly
  const { start, end } = getDateRange(period);

  const summary = await Expense.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(req.user._id), // <-- fixed here
        date: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$amount" },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    period,
    total: summary[0]?.totalAmount || 0,
  });
});

const SetExpense = asyncHandler(async (req, res) => {
  const {
    category,
    amount,
    date,
    notes,
    modeofpayment,
    tags,
    recurring,
    frequency,
  } = req.body;

  if (!category || !amount) {
    throw new ApiError(400, "Category and amount are required");
  }

  let nextOccurrence;
  if (recurring && frequency) {
    const baseDate = date ? new Date(date) : new Date();
    nextOccurrence = addFrequency(baseDate, frequency);
  }

  const expense = await Expense.create({
    category,
    amount,
    date: date ? new Date(date) : undefined,
    notes,
    modeofpayment,
    tags,
    recurring,
    frequency,
    user: req.user._id,
    nextOccurrence, // <-- set here if recurring
  });
  res.status(201).json({ success: true, data: expense });
});

const getUserExpenses = asyncHandler(async (req, res) => {
  const expense = await Expense.find({ user: req.user._id }).sort({ date: -1 });

  res.status(200).json({ success: true, data: expense });
});

const updateExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!expense) throw new ApiError(404, "Expense not found");

  res.status(200).json({ success: true, data: expense });
});

const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!expense) throw new ApiError(404, "Expense not found");

  res.status(200).json({ success: true, message: "Expense deleted" });
});

const getCategoryWiseSummary = asyncHandler(async (req, res) => {
  try {
    const summary = await Expense.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user._id),
        },
      },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" },
        },
      },
      {
        $sort: { totalAmount: -1 },
      },
    ]);

    const labels = summary.map((item) => item._id);
    const data = summary.map((item) => item.totalAmount);

    res.status(200).json({
      success: true,
      labels,
      data,
    });
  } catch (error) {
    throw new ApiError(500, "SOMETHING WENT WRONG");
  }
});

const getLast7DaysSummary = asyncHandler(async (req, res) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 6);

  const summary = await Expense.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(req.user._id),
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$date" },
        },
        totalAmount: { $sum: "$amount" },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  const dates = [];
  const dataMap = {};

  // Build date keys for last 7 days
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const str = d.toISOString().split("T")[0];
    dates.push(str);
    dataMap[str] = 0;
  }

  summary.forEach((item) => {
    dataMap[item._id] = item.totalAmount;
  });

  const data = dates.map((d) => dataMap[d]);

  res.status(200).json({ success: true, labels: dates, data });
});

const getLast6MonthsSummary = asyncHandler(async (req, res) => {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const summary = await Expense.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(req.user._id),
        date: { $gte: sixMonthsAgo, $lte: now },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" },
        },
        totalAmount: { $sum: "$amount" },
      },
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1 },
    },
  ]);

  const labels = [];
  const data = [];

  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const label = d.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });

    const found = summary.find(
      (item) =>
        item._id.month === d.getMonth() + 1 && item._id.year === d.getFullYear()
    );

    labels.push(label);
    data.push(found ? found.totalAmount : 0);
  }

  res.status(200).json({ success: true, labels, data });
});

export {
  getExpenseSummary,
  SetExpense,
  getUserExpenses,
  updateExpense,
  deleteExpense,
  getCategoryWiseSummary,
  getLast7DaysSummary,
  getLast6MonthsSummary,
};
