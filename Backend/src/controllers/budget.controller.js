import { Budget } from "../models/budget.model.js";
import { Expense } from "../models/Expense.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import { OverallBudget } from "../models/overallbudgetmodel.js";

import mongoose from "mongoose";
import { User } from "../models/Users.models.js";
import { ApiResponse } from "../utils/apiResponse.js";

const setOrUpdateBudget = asyncHandler(async (req, res) => {
  const { category, amount } = req.body;

  if (!category || amount == null || isNaN(amount) || amount < 0) {
    throw new ApiError(400, "Valid category and positive amount are required");
  }

  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const existingBudgets = await Budget.find({
    user: req.user._id,
    month,
    year,
  });

  const totalCategoryBudgets =
    existingBudgets
      .filter((b) => b.category !== category) // Exclude current one if updating
      .reduce((sum, b) => sum + b.amount, 0) + amount;

  const overall = await OverallBudget.findOne({
    user: req.user._id,
    month,
    year,
  });

  if (overall && totalCategoryBudgets > overall.amount) {
    throw new ApiError(400, "Category budgets exceed overall monthly budget.");
  }

  const budget = await Budget.findOneAndUpdate(
    { user: req.user._id, category, month, year },
    { amount: Number(amount) },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  res.status(200).json({ success: true, data: budget });
});

const setOrUpdateOverallBudget = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const existingBudgets = await Budget.find({
    user: req.user._id,
    month,
    year,
  });
  const totalCategoryBudgets = existingBudgets.reduce(
    (sum, b) => sum + b.amount,
    0
  );

  if (amount < totalCategoryBudgets) {
    throw new ApiError(
      400,
      "Overall budget is less than total category budgets."
    );
  }

  const budget = await OverallBudget.findOneAndUpdate(
    { user: req.user._id, month, year },
    { amount: Number(amount) },
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
          user: new mongoose.Types.ObjectId(req.user._id),
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


const getOverAllBudget = asyncHandler(async(req,res)=>{
  const now = new Date();
  const month = now.getMonth();
  const year =  now.getFullYear();


    const overall = await OverallBudget.findOne({
      user:req.user._id,
      month,
      year,
    });
    if(!overall){
      throw new ApiError(404,"OverAll budget not set  for this month")
    }
       return res.status(200).json(new ApiResponse(200, overall, "Overall budget fetched"));
})

export {
  setOrUpdateBudget,
  getBudget,
  getBudgetStatus,
  setOrUpdateOverallBudget,
  getOverAllBudget
};
