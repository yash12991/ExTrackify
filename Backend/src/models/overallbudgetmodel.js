// models/overallBudget.model.js

import mongoose, { Schema } from "mongoose";

const overallBudgetSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  month: {
    type: Number, // 0-11
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

overallBudgetSchema.index({ user: 1, month: 1, year: 1 }, { unique: true });

export const OverallBudget = mongoose.model("OverallBudget", overallBudgetSchema);
