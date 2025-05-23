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
      min:1,
    },
    frequency: {
      type: String,
      enum: ["monthly", "quarterly","yearly"],
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
    notes: {
      type: String,
      trim: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
  },
  { timestamps: true }
);
