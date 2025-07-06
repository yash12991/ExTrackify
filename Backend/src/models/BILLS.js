import mongoose, { Schema } from "mongoose";

const BillsSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    billName: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      default: 0,
    },
    dueDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    frequency: {
      type: String,
      enum: ["one-time", "weekly", "monthly","3months","quaterly","6months", "yearly"],
      default: "monthly",
    },
    category: {
      type: String,
      default: "General",
    },
    status: {
      type: String,
      enum: ["pending", "paid", "overdue"],
      default: "pending",
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

export const Bills = mongoose.model("Bills", BillsSchema);
