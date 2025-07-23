// utils/sipSummary.js
import { SIP } from "../models/SIP.models.js";
import { Payment } from "../models/Payment.models.js";

export const generateMonthlySummary = async (userId) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const sips = await SIP.find({ user: userId });
  const payments = await Payment.find({
    user: userId,
    paymentDate: { $gte: startOfMonth, $lte: endOfMonth },
  });

  // Process and return summary data
  return { sips, payments };
};
