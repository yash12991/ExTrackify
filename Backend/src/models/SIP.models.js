import mongoose, { Schema } from "mongoose";

const sipSchema = new Schema(
  {
    sipName: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1000,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    durationInMonths: {
      type: Number,
      default: 12,
      min: 1,
    },
    frequency: {
      type: String,
      enum: ["monthly", "quarterly", "yearly"],
      default: "monthly",
    },
    goal: {
      type: String,
      trim: true,
      default: "General Investment",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    totalInvested: {
      type: Number,
      default: 0,
    },
    nextPaymentDate: {
      type: Date,
    },
    expectedRate: {
      type: Number,
      required: true,
      min: 0,
      max: 50,
      default: 12,
    },
    expectedMaturityValue: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const SIP = mongoose.model("SIP", sipSchema);
