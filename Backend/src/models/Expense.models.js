import mongoose, { Schema } from "mongoose";

const ExpenseSchema = new Schema(
  {
    category: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    notes: {
      type: String,
      default: "Want to add notes",
      trim: true,
    },
    modeofpayment: {
      type: String,
      enum: ["upi", "card", "cash", "cheque"],
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    recurring: {
      type: Boolean,
      default: false,
    },
    frequency: {
  type: String,
  enum: ["daily", "weekly", "monthly"],
  default: "monthly",
},
nextOccurrence: {
  type: Date,
}
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

export const Expense = mongoose.model("Expense", ExpenseSchema);
