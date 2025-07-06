import mongoose, { Schema } from "mongoose";

const goalSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    targetAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    currentSaved: {
      type: Number,
      default: 0,
      min: 0,
    },
    dailySavingRate: {
      type: Number,
      required: true,
      min: 0,
    },
    estimatedCompletionDate: {
      type: Date,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["in-progress", "completed"],
      default: "in-progress",
    },
    frequency: {
      type: String,
      enum: ["daily", "weekly"],
      default: "daily",
    },
  },
  { timestamps: true }
);

goalSchema.index({ user: 1, status: 1 });

export const Goal = mongoose.model("Goal", goalSchema);
