import { Budget } from "../models/budget.model.js";
import { Expense } from "../models/Expense.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const setOrUpdateBudget = asyncHandler(async (req, res) => {
  const { category, amount } = req.body;

  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const budget = await Budget.findOneAndUpdate(
    { user: req.user._id, category, month, year },
    { amount },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  res.status(200).json({ success: true, data: budget });
});

const getBudget = asyncHandler(async (req, res) => {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const budgets = await Budget.find({ user: req.user._id, month, year });

  res.status(200).json({ success: true, data: budgets });
});

const getBudgetStatus = asyncHandler(async (req, res) => {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const budgets = await Budget.find({ user: req.user._id, month, year });

  const result = [];

  for (const budget of budgets) {
    const totalSpent = await Expense.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId(req.user._id),
          category: budget.category,
          date: {
            $gte: new Date(year, month, 1),
            $lt: new Date(year, month + 1, 1),
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const spent = totalSpent[0]?.total || 0;

    result.push({
      category: budget.category,
      budget: budget.amount,
      spent,
      remaining: Math.max(0, budget.amount - spent),
      exceeded: spent > budget.amount,
    });
  }

  res.status(200).json({ success: true, data: result });
});

export { setOrUpdateBudget, getBudget, getBudgetStatus };
