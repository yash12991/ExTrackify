import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  sip: { type: mongoose.Schema.Types.ObjectId, ref: "SIP", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  paymentDate: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["paid", "pending", "failed"],
    default: "paid",
  },
});

export const Payment = mongoose.model("Payment", PaymentSchema);
