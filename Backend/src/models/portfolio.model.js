import mongoose from "mongoose";

const holdingSchema = new mongoose.Schema({
  type: { type: String, enum: ["stock", "mutual_fund"], required: true },
  symbol: { type: String },
  schemeCode: { type: Number },
  schemeName: { type: String },
  name: { type: String },
  quantity: { type: Number, required: true, min: 0 },
  buyPrice: { type: Number, min: 0 },
  buyNav: { type: Number, min: 0 },
  totalInvested: { type: Number, required: true, min: 0 },
  currentPrice: { type: Number },
  currentNav: { type: Number },
  currentValue: { type: Number },
  returnPercent: { type: Number },
}, { _id: false });

const portfolioSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  holdings: [holdingSchema],
  totalInvested: { type: Number, default: 0 },
  totalCurrentValue: { type: Number, default: 0 },
  totalReturn: { type: Number, default: 0 },
  totalReturnPercent: { type: Number, default: 0 },
}, { timestamps: true });

export const Portfolio = mongoose.model("Portfolio", portfolioSchema);
