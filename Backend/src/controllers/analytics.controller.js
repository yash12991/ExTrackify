import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Expense } from "../models/Expense.models.js";
import { Bills } from "../models/BILLS.js";
import { Goal } from "../models/Goal.models.js";
import { SIP } from "../models/SIP.models.js";

const getSpendingAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { months = 6 } = req.query;
  const since = new Date();
  since.setMonth(since.getMonth() - parseInt(months));

  const [categoryData, monthlyData, dailyAvg, topExpenses, billData, goalData, sipData] = await Promise.all([
    Expense.aggregate([
      { $match: { user: userId, date: { $gte: since } } },
      { $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]),
    Expense.aggregate([
      { $match: { user: userId, date: { $gte: since } } },
      { $group: { _id: { year: { $year: "$date" }, month: { $month: "$date" } }, total: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),
    Expense.aggregate([
      { $match: { user: userId, date: { $gte: since } } },
      { $group: { _id: null, avgDaily: { $avg: "$amount" }, totalSpent: { $sum: "$amount" }, totalCount: { $sum: 1 } } },
    ]),
    Expense.find({ user: userId }).sort({ amount: -1 }).limit(10).lean(),
    Bills.aggregate([
      { $match: { userId, status: "paid" } },
      { $group: { _id: null, totalPaid: { $sum: "$amount" } } },
    ]),
    Goal.find({ user: userId }).lean(),
    SIP.aggregate([
      { $match: { user: userId, isActive: true } },
      { $group: { _id: null, totalMonthly: { $sum: "$amount" }, totalInvested: { $sum: "$totalInvested" } } },
    ]),
  ]);

  const totalSpent = dailyAvg[0]?.totalSpent || 0;
  const totalCount = dailyAvg[0]?.totalCount || 0;
  const avgDaily = dailyAvg[0]?.avgDaily || 0;
  const avgTransaction = totalCount > 0 ? totalSpent / totalCount : 0;

  const topCategory = categoryData[0]?._id || "N/A";
  const topCategoryAmount = categoryData[0]?.total || 0;
  const categoryPercent = totalSpent > 0 ? (topCategoryAmount / totalSpent) * 100 : 0;

  return res.status(200).json(new ApiResponse(200, {
    categoryBreakdown: categoryData,
    monthlyTrend: monthlyData,
    summary: { totalSpent, totalTransactions: totalCount, avgDaily, avgTransaction },
    topCategory: { name: topCategory, amount: topCategoryAmount, percent: categoryPercent },
    topExpenses,
    billsPaid: billData[0]?.totalPaid || 0,
    goalsTotal: sipData.reduce((s, g) => s + g.targetAmount, 0),
    sipMonthlyTotal: sipData[0]?.totalMonthly || 0,
    sipTotalInvested: sipData[0]?.totalInvested || 0,
  }, "OK"));
});

const getMonthlyComparison = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const currentMonth = new Date();
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  const getMonthData = async (date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const expenses = await Expense.find({ user: userId, date: { $gte: start, $lte: end } }).lean();
    const total = expenses.reduce((s, e) => s + e.amount, 0);
    const categoryTotals = {};
    expenses.forEach((e) => { categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount; });
    return { total, count: expenses.length, categoryTotals };
  };

  const [curr, prev] = await Promise.all([getMonthData(currentMonth), getMonthData(lastMonth)]);
  const change = prev.total > 0 ? ((curr.total - prev.total) / prev.total) * 100 : 0;

  return res.status(200).json(new ApiResponse(200, {
    current: curr, previous: prev, change, isUp: change >= 0,
  }, "OK"));
});

export { getSpendingAnalytics, getMonthlyComparison };
