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
      required: [true, "Amount is required"],
      min: [0, "Amount must be positive"],
      validate: {
        validator: function (v) {
          return !isNaN(v) && v >= 0;
        },
        message: "Invalid amount value",
      },
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
      validate: {
        validator: function (v) {
          // Ensure it's a valid date and not in the future
          return v instanceof Date && !isNaN(v) && v <= new Date();
        },
        message: "Invalid date format or future date",
      },
      // Convert to start of day when setting
      set: function (v) {
        const d = new Date(v);
        d.setHours(0, 0, 0, 0);
        return d;
      },
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
      enum: {
        values: ["upi", "card", "cash", "cheque"],
        message: "{VALUE} is not a valid payment mode",
      },
      required: [true, "Mode of payment is required"],
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
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Add pre-save middleware for data cleaning
ExpenseSchema.pre("save", function (next) {
  if (this.category) this.category = this.category.trim();
  if (this.notes) this.notes = this.notes.trim();
  if (this.tags) this.tags = this.tags.map((tag) => tag.trim());
  next();
});

ExpenseSchema.index({ user: 1, date: -1 }); // Compound index for faster queries
ExpenseSchema.index({ category: 1 });
ExpenseSchema.index({ amount: 1 });

// Add validation methods
ExpenseSchema.methods.isRecurringValid = function () {
  if (this.recurring && !this.frequency) {
    return false;
  }
  return true;
};

// Add static methods
ExpenseSchema.statics.getCategoryTotals = async function (userId) {
  return this.aggregate([
    { $match: { user: userId } },
    { $group: { _id: "$category", total: { $sum: "$amount" } } },
  ]);
};

export const Expense = mongoose.model("Expense", ExpenseSchema);
