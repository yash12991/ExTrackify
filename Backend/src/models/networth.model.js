import mongoose from "mongoose";

const netWorthSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  date: { type: Date, default: Date.now, index: true },
  totalAssets: { type: Number, default: 0 },
  totalLiabilities: { type: Number, default: 0 },
  netWorth: { type: Number, default: 0 },
  breakdown: {
    cashInBank: { type: Number, default: 0 },
    investments: { type: Number, default: 0 },
    sipValue: { type: Number, default: 0 },
    totalExpenses: { type: Number, default: 0 },
    totalBills: { type: Number, default: 0 },
    sipTotalInvested: { type: Number, default: 0 },
  },
}, { timestamps: false });

netWorthSchema.index({ user: 1, date: -1 });

export const NetWorth = mongoose.model("NetWorth", netWorthSchema);
