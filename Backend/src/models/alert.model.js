import mongoose from "mongoose";

const alertSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  type: { type: String, enum: ["stock", "mutual_fund"], required: true },
  symbol: { type: String },
  schemeCode: { type: Number },
  schemeName: { type: String },
  name: { type: String },
  targetPrice: { type: Number },
  targetNav: { type: Number },
  condition: { type: String, enum: ["above", "below"], required: true },
  currentPrice: { type: Number },
  currentNav: { type: Number },
  isTriggered: { type: Boolean, default: false },
  triggeredAt: { type: Date },
  lastChecked: { type: Date },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

alertSchema.index({ user: 1, isActive: 1 });
alertSchema.index({ type: 1, isActive: 1, lastChecked: 1 });

export const Alert = mongoose.model("Alert", alertSchema);
