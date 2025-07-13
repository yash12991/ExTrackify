import { Bills } from "../models/BILLS.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

// Create a new bill
const createBill = asyncHandler(async (req, res) => {
  try {
    const { billName, amount, dueDate, frequency, category, notes } = req.body;

    // Validation
    if (!billName || !amount || !dueDate) {
      throw new ApiError(400, "Bill name, amount, and due date are required");
    }

    if (amount <= 0) {
      throw new ApiError(400, "Amount must be greater than 0");
    }

    const bill = await Bills.create({
      userId: req.user._id,
      billName,
      amount,
      dueDate,
      frequency: frequency || "monthly",
      category: category || "General",
      notes: notes || "",
      status: "pending",
    });

    res
      .status(201)
      .json(new ApiResponse(201, bill, "Bill created successfully"));
  } catch (error) {
    console.error("Create bill error:", error);
    throw new ApiError(500, error.message || "Failed to create bill");
  }
});

// Get all bills for a user
const getUserBills = asyncHandler(async (req, res) => {
  try {
    const {
      status,
      frequency,
      category,
      sortBy = "dueDate",
      order = "asc",
    } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { userId: req.user._id };

    if (status && status !== "all") {
      filter.status = status;
    }

    if (frequency && frequency !== "all") {
      filter.frequency = frequency;
    }

    if (category && category !== "all") {
      filter.category = category;
    }

    // Build sort object
    const sortOrder = order === "desc" ? -1 : 1;
    const sort = { [sortBy]: sortOrder };

    const bills = await Bills.find(filter).sort(sort).skip(skip).limit(limit);

    const totalBills = await Bills.countDocuments(filter);
    const totalPages = Math.ceil(totalBills / limit);

    res.status(200).json(
      new ApiResponse(
        200,
        {
          bills,
          pagination: {
            currentPage: page,
            totalPages,
            totalBills,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        },
        "Bills fetched successfully"
      )
    );
  } catch (error) {
    console.error("Get bills error:", error);
    throw new ApiError(500, error.message || "Failed to fetch bills");
  }
});

// Get bill by ID
const getBillById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid bill ID");
    }

    const bill = await Bills.findOne({ _id: id, userId: req.user._id });

    if (!bill) {
      throw new ApiError(404, "Bill not found");
    }

    res
      .status(200)
      .json(new ApiResponse(200, bill, "Bill fetched successfully"));
  } catch (error) {
    console.error("Get bill by ID error:", error);
    throw new ApiError(500, error.message || "Failed to fetch bill");
  }
});

// Update bill
const updateBill = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { billName, amount, dueDate, frequency, category, status, notes } =
      req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid bill ID");
    }

    const bill = await Bills.findOne({ _id: id, userId: req.user._id });

    if (!bill) {
      throw new ApiError(404, "Bill not found");
    }

    // Validation
    if (amount && amount <= 0) {
      throw new ApiError(400, "Amount must be greater than 0");
    }

    const updatedBill = await Bills.findByIdAndUpdate(
      id,
      {
        ...(billName && { billName }),
        ...(amount && { amount }),
        ...(dueDate && { dueDate }),
        ...(frequency && { frequency }),
        ...(category && { category }),
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
      },
      { new: true, runValidators: true }
    );

    res
      .status(200)
      .json(new ApiResponse(200, updatedBill, "Bill updated successfully"));
  } catch (error) {
    console.error("Update bill error:", error);
    throw new ApiError(500, error.message || "Failed to update bill");
  }
});

// Delete bill
const deleteBill = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid bill ID");
    }

    const bill = await Bills.findOne({ _id: id, userId: req.user._id });

    if (!bill) {
      throw new ApiError(404, "Bill not found");
    }

    await Bills.findByIdAndDelete(id);

    res.status(200).json(new ApiResponse(200, {}, "Bill deleted successfully"));
  } catch (error) {
    console.error("Delete bill error:", error);
    throw new ApiError(500, error.message || "Failed to delete bill");
  }
});

// Mark bill as paid
const markBillAsPaid = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid bill ID");
    }

    const bill = await Bills.findOne({ _id: id, userId: req.user._id });

    if (!bill) {
      throw new ApiError(404, "Bill not found");
    }

    const updatedBill = await Bills.findByIdAndUpdate(
      id,
      { status: "paid" },
      { new: true }
    );

    res
      .status(200)
      .json(
        new ApiResponse(200, updatedBill, "Bill marked as paid successfully")
      );
  } catch (error) {
    console.error("Mark bill as paid error:", error);
    throw new ApiError(500, error.message || "Failed to mark bill as paid");
  }
});

// Get bills summary
const getBillsSummary = asyncHandler(async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const summary = await Bills.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    // Get upcoming bills (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const upcomingBills = await Bills.find({
      userId: req.user._id,
      dueDate: { $lte: nextWeek },
      status: "pending",
    })
      .sort({ dueDate: 1 })
      .limit(5);

    // Get overdue bills
    const today = new Date();
    const overdueBills = await Bills.find({
      userId: req.user._id,
      dueDate: { $lt: today },
      status: "pending",
    }).sort({ dueDate: 1 });

    // Update overdue bills status
    if (overdueBills.length > 0) {
      await Bills.updateMany(
        {
          userId: req.user._id,
          dueDate: { $lt: today },
          status: "pending",
        },
        { status: "overdue" }
      );
    }

    // Format summary
    const summaryData = {
      pending: { count: 0, totalAmount: 0 },
      paid: { count: 0, totalAmount: 0 },
      overdue: { count: 0, totalAmount: 0 },
    };

    summary.forEach((item) => {
      summaryData[item._id] = {
        count: item.count,
        totalAmount: item.totalAmount,
      };
    });

    res.status(200).json(
      new ApiResponse(
        200,
        {
          summary: summaryData,
          upcomingBills,
          overdueCount: overdueBills.length,
        },
        "Bills summary fetched successfully"
      )
    );
  } catch (error) {
    console.error("Get bills summary error:", error);
    throw new ApiError(500, error.message || "Failed to fetch bills summary");
  }
});

// Get bills by category
const getBillsByCategory = asyncHandler(async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const categoryData = await Bills.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
          bills: { $push: "$$ROOT" },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          categoryData,
          "Bills by category fetched successfully"
        )
      );
  } catch (error) {
    console.error("Get bills by category error:", error);
    throw new ApiError(
      500,
      error.message || "Failed to fetch bills by category"
    );
  }
});

// Get monthly bills total
const getMonthlyBillsTotal = asyncHandler(async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const {
      year = new Date().getFullYear(),
      month = new Date().getMonth() + 1,
    } = req.query;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const monthlyTotal = await Bills.aggregate([
      {
        $match: {
          userId,
          dueDate: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          paidAmount: {
            $sum: {
              $cond: [{ $eq: ["$status", "paid"] }, "$amount", 0],
            },
          },
          pendingAmount: {
            $sum: {
              $cond: [{ $eq: ["$status", "pending"] }, "$amount", 0],
            },
          },
          overdueAmount: {
            $sum: {
              $cond: [{ $eq: ["$status", "overdue"] }, "$amount", 0],
            },
          },
        },
      },
    ]);

    const result = monthlyTotal[0] || {
      totalAmount: 0,
      paidAmount: 0,
      pendingAmount: 0,
      overdueAmount: 0,
    };

    res
      .status(200)
      .json(
        new ApiResponse(200, result, "Monthly bills total fetched successfully")
      );
  } catch (error) {
    console.error("Get monthly bills total error:", error);
    throw new ApiError(
      500,
      error.message || "Failed to fetch monthly bills total"
    );
  }
});

export {
  createBill,
  getUserBills,
  getBillById,
  updateBill,
  deleteBill,
  markBillAsPaid,
  getBillsSummary,
  getBillsByCategory,
  getMonthlyBillsTotal,
};
