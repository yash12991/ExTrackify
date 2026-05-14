import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { NetWorth } from "../models/networth.model.js";
import { Expense } from "../models/Expense.models.js";
import { Bills } from "../models/BILLS.js";
import { SIP } from "../models/SIP.models.js";
import { Portfolio } from "../models/portfolio.model.js";

const calculateNetWorth = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [totalExpenses, totalBills, sipData, portfolio] = await Promise.all([
    Expense.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Bills.aggregate([
      { $match: { userId, status: { $in: ["pending", "overdue"] } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    SIP.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, totalInvested: { $sum: "$totalInvested" }, monthlySip: { $sum: "$amount" } } },
    ]),
    Portfolio.findOne({ user: userId }),
  ]);

  const investments = portfolio?.totalCurrentValue || 0;
  const sipValue = sipData[0]?.totalInvested || 0;
  const expenses = totalExpenses[0]?.total || 0;
  const bills = totalBills[0]?.total || 0;

  const totalAssets = investments + sipValue;
  const totalLiabilities = expenses + bills;
  const netWorth = totalAssets - totalLiabilities;

  const snapshot = await NetWorth.create({
    user: userId,
    totalAssets,
    totalLiabilities,
    netWorth,
    breakdown: {
      cashInBank: 0,
      investments,
      sipValue,
      totalExpenses: expenses,
      totalBills: bills,
      sipTotalInvested: sipValue,
    },
  });

  return res.status(200).json(new ApiResponse(200, snapshot, "Net worth calculated"));
});

const getNetWorthHistory = asyncHandler(async (req, res) => {
  const { period = "30" } = req.query;
  const since = new Date();
  since.setDate(since.getDate() - parseInt(period));

  const history = await NetWorth.find({
    user: req.user._id,
    date: { $gte: since },
  }).sort({ date: -1 }).lean();

  const latest = history[0] || null;
  const previous = history.length > 1 ? history[history.length - 1] : null;
  const change = latest && previous ? latest.netWorth - previous.netWorth : 0;

  return res.status(200).json(new ApiResponse(200, {
    current: latest?.netWorth || 0,
    totalAssets: latest?.totalAssets || 0,
    totalLiabilities: latest?.totalLiabilities || 0,
    change,
    history: history.reverse(),
    investments: latest?.breakdown?.investments || 0,
    sipValue: latest?.breakdown?.sipValue || 0,
  }, "OK"));
});

export { calculateNetWorth, getNetWorthHistory };
