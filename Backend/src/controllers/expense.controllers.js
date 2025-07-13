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
  try {
    const period = req.query.period || "monthly";
    const { start, end } = getDateRange(period);

    // Convert dates to start and end of day
    const startDate = new Date(start);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);

    // Log dates for debugging
    console.log("Query date range:", {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    const userId = new mongoose.Types.ObjectId(req.user._id);

    const summary = await Expense.aggregate([
      {
        $match: {
          user: userId,
          date: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 }, // Add count for debugging
        },
      },
    ]);

    console.log("Raw query result:", summary);

    const response = {
      success: true,
      period,
      total: summary.length > 0 ? summary[0].totalAmount : 0,
      count: summary.length > 0 ? summary[0].count : 0,
      dateRange: {
        start: startDate,
        end: endDate,
      },
    };

    console.log("Response:", response);
    return res.status(200).json(response);
  } catch (error) {
    console.error("Detailed error in getExpenseSummary:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    throw new ApiError(500, "Failed to get expense summary");
  }
});

const SetExpense = asyncHandler(async (req, res) => {
  try {
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

    // Validate required fields
    if (!category || !amount || !modeofpayment) {
      throw new ApiError(
        400,
        "Category, amount, and mode of payment are required"
      );
    }

    // Validate amount
    if (isNaN(amount) || amount <= 0) {
      throw new ApiError(400, "Amount must be a positive number");
    }

    // Parse and validate date
    const expenseDate = new Date(date || Date.now());
    // const expenseDate = new Date(date || Date.now());
    expenseDate.setHours(0, 0, 0, 0); // Set to start of day

    if (isNaN(expenseDate.getTime())) {
      throw new ApiError(400, "Invalid date format");
    }

    let nextOccurrence = null;
    if (recurring && frequency) {
      nextOccurrence = addFrequency(expenseDate, frequency);
    }

    // Create expense with validated data
    const expense = await Expense.create({
      category: category.trim(),
      amount: Number(amount),
      date: expenseDate,
      notes: notes?.trim(),
      modeofpayment,
      tags: Array.isArray(tags) ? tags.map((tag) => tag.trim()) : [],
      recurring: Boolean(recurring),
      frequency,
      user: new mongoose.Types.ObjectId(req.user._id),
      nextOccurrence,
    });

    // Verify expense was created
    if (!expense) {
      throw new ApiError(500, "Failed to create expense");
    }

    res.status(201).json({
      success: true,
      data: expense,
      message: "Expense created successfully",
    });
  } catch (error) {
    console.error("Error in SetExpense:", error);
    throw new ApiError(
      error.statusCode || 500,
      error.message || "Failed to create expense"
    );
  }
});

const getUserExpenses = asyncHandler(async (req, res) => {
  try {
    // Input validation and sanitization
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const sortBy = ["date", "amount", "category", "time", "createdAt"].includes(
      req.query.sortBy
    )
      ? req.query.sortBy
      : "date";
    const sortOrder = ["asc", "desc"].includes(req.query.sortOrder)
      ? req.query.sortOrder
      : "desc";

    // Build base query
    const query = { user: req.user._id };

    // Category filter
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      query.date = {};
      if (req.query.startDate) {
        const startDate = new Date(req.query.startDate);
        if (!isNaN(startDate)) {
          query.date.$gte = startDate.setHours(0, 0, 0, 0);
        }
      }
      if (req.query.endDate) {
        const endDate = new Date(req.query.endDate);
        if (!isNaN(endDate)) {
          query.date.$lte = endDate.setHours(23, 59, 59, 999);
        }
      }
    }

    // Amount range filter
    if (req.query.minAmount || req.query.maxAmount) {
      query.amount = {};
      if (req.query.minAmount) {
        query.amount.$gte = Number(req.query.minAmount);
      }
      if (req.query.maxAmount) {
        query.amount.$lte = Number(req.query.maxAmount);
      }
    }

    // Determine sort field - use createdAt for time-based sorting
    let sortField = sortBy;
    if (sortBy === "time") {
      sortField = "createdAt";
    }

    // Execute query with pagination
    const [expenses, total] = await Promise.all([
      Expense.find(query)
        .sort({ [sortField]: sortOrder === "desc" ? -1 : 1 })
        .limit(limit)
        .skip((page - 1) * limit)
        .lean(),
      Expense.countDocuments(query),
    ]);

    // Send response
    return res.status(200).json({
      success: true,
      data: expenses,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error) {
    throw new ApiError(500, `Error fetching expenses: ${error.message}`);
  }
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
        user: new mongoose.Types.ObjectId(req.user._id), // Fixed: added 'new'
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
