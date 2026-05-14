import Groq from "groq-sdk";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Expense } from "../models/Expense.models.js";
import { Bills } from "../models/BILLS.js";
import { SIP } from "../models/SIP.models.js";
import { Budget } from "../models/budget.model.js";
import { Goal } from "../models/Goal.models.js";
import mongoose from "mongoose";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const chatWithBot = asyncHandler(async (req, res) => {
  const { message } = req.body;
  if (!message?.trim()) {
    throw new ApiError(400, "Message is required");
  }

  const userId = new mongoose.Types.ObjectId(req.user._id);

  const [expenses, bills, sips, budgets, goals] = await Promise.all([
    Expense.find({ user: userId }).sort({ date: -1 }).limit(50).lean(),
    Bills.find({ userId }).sort({ dueDate: -1 }).limit(50).lean(),
    SIP.find({ user: userId }).sort({ createdAt: -1 }).limit(50).lean(),
    Budget.find({ user: userId }).sort({ year: -1, month: -1 }).limit(50).lean(),
    Goal.find({ user: userId }).sort({ createdAt: -1 }).limit(50).lean(),
  ]);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalBills = bills.reduce((sum, b) => sum + b.amount, 0);
  const totalSIPInvested = sips.reduce((sum, s) => sum + s.totalInvested, 0);
  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalGoalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalGoalSaved = goals.reduce((sum, g) => sum + g.currentSaved, 0);

  const activeSIPs = sips.filter((s) => s.isActive);
  const pendingBills = bills.filter((b) => b.status === "pending");
  const overdueBills = bills.filter((b) => b.status === "overdue");
  const activeGoals = goals.filter((g) => g.status === "in-progress");
  const completedGoals = goals.filter((g) => g.status === "completed");

  const categoryBreakdown = {};
  expenses.forEach((e) => {
    categoryBreakdown[e.category] = (categoryBreakdown[e.category] || 0) + e.amount;
  });
  const topCategory = Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])[0];

  const linkedFunds = sips.filter((s) => s.schemeCode);
  const mfCategories = [...new Set(linkedFunds.map((s) => s.schemeName?.split("-")[0]?.trim()).filter(Boolean))];

  const systemPrompt = `You are ExTrackify AI, a professional financial assistant integrated into the ExTrackify expense tracking application. Your role is to help users understand and manage their finances based on their actual data.

CURRENT USER FINANCIAL SUMMARY:
- Total Expenses: ₹${totalExpenses.toLocaleString()}
- Total Bills: ₹${totalBills.toLocaleString()}
- Total SIP Investments: ₹${totalSIPInvested.toLocaleString()}
- Total Budget Set: ₹${totalBudget.toLocaleString()}
- Total Goal Target: ₹${totalGoalTarget.toLocaleString()}
- Total Goal Saved: ₹${totalGoalSaved.toLocaleString()}
- Active SIPs: ${activeSIPs.length}
- Pending Bills: ${pendingBills.length}
- Overdue Bills: ${overdueBills.length}
- Active Goals: ${activeGoals.length}
- Completed Goals: ${completedGoals.length}
- Mutual Funds Linked: ${linkedFunds.length}
${linkedFunds.length > 0 ? `- Fund Houses Invested: ${mfCategories.join(", ")}` : ""}
${topCategory ? `- Top Spending Category: ${topCategory[0]} (₹${topCategory[1].toLocaleString()})` : ""}

RECENT EXPENSES (last 50):
${expenses.slice(0, 10).map((e) => `- ${e.category}: ₹${e.amount} on ${new Date(e.date).toLocaleDateString()} (${e.modeofpayment})`).join("\n")}

UPCOMING BILLS:
${bills.filter((b) => b.status !== "paid").slice(0, 10).map((b) => `- ${b.billName}: ₹${b.amount} due ${new Date(b.dueDate).toLocaleDateString()} [${b.status}]`).join("\n")}

SIPs:
${sips.slice(0, 10).map((s) => {
  const fundInfo = s.schemeName ? ` [Fund: ${s.schemeName}]` : "";
  return `- ${s.sipName}: ₹${s.amount}/mo, invested: ₹${s.totalInvested}, goal: ${s.goal}${fundInfo} [${s.isActive ? "Active" : "Inactive"}]`;
}).join("\n")}

GOALS:
${goals.slice(0, 10).map((g) => `- ${g.title}: ₹${g.currentSaved}/${g.targetAmount} [${g.status}]`).join("\n")}

Guidelines:
1. Be concise, professional, and helpful
2. Provide actionable financial insights
3. Use ₹ for Indian Rupee formatting
4. Reference specific user data when answering
5. Suggest budget improvements, saving tips, and investment advice
6. If asked about something not in the data, be honest but provide general guidance
7. Format responses with bullet points and sections for readability
8. Keep responses under 500 words
9. Use a friendly but professional tone
10. Never share raw data unless asked
11. The app has a Mutual Fund explorer and search (powered by mfapi.in) — users can browse, compare, and start SIPs in any fund
12. For fund-specific questions, use terms like "equity", "debt", "hybrid", "large cap", "mid cap", "small cap", "ELSS", "liquid", "index"`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1024,
    });

    const reply = completion.choices[0]?.message?.content || "I'm sorry, I couldn't process that request.";

    return res.status(200).json(new ApiResponse(200, { reply }, "OK"));
  } catch (error) {
    console.error("Groq API error:", error);
    throw new ApiError(500, "Failed to get response from AI assistant");
  }
});

const analyzeStock = asyncHandler(async (req, res) => {
  const { symbol, stockData } = req.body;
  if (!symbol || !stockData) {
    throw new ApiError(400, "Symbol and stock data are required");
  }

  const systemPrompt = `You are ExTrackify AI, a professional stock market analyst integrated into the ExTrackify finance app. Analyze the following Indian stock data and provide clear, actionable insights.

STOCK: ${symbol}

CURRENT DATA:
- Price: ₹${stockData.price}
- Change: ${stockData.change} (${stockData.changePercent}%)
- Day Range: ₹${stockData.dayLow} - ₹${stockData.dayHigh}
- 52-Week Range: ₹${stockData.yearLow} - ₹${stockData.yearHigh}
- Previous Close: ₹${stockData.previousClose}
- Open: ₹${stockData.open}
- Volume: ${stockData.volume?.toLocaleString()}
- Avg Volume: ${stockData.avgVolume?.toLocaleString()}
- Market Cap: ${stockData.marketCap ? `₹${(stockData.marketCap / 10000000).toFixed(2)}Cr` : "N/A"}
- P/E Ratio: ${stockData.peRatio || "N/A"}
- Dividend Yield: ${stockData.dividendYield ? `${(stockData.dividendYield * 100).toFixed(2)}%` : "N/A"}
- Market State: ${stockData.marketState || "N/A"}

Guidelines:
1. Analyze the stock's current position relative to its 52-week range
2. Comment on valuation using P/E ratio
3. Note volume trends compared to average
4. Provide a brief outlook (bullish/bearish/neutral) with reasoning
5. Keep response under 200 words
6. Use ₹ for Indian Rupee formatting
7. Be concise and professional
8. Format with bullet points for readability
9. Include a clear "Verdict" at the end`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Analyze ${symbol} at ₹${stockData.price} (${stockData.changePercent}% today)` },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      max_tokens: 800,
    });

    const analysis = completion.choices[0]?.message?.content || "Analysis unavailable.";
    return res.status(200).json(new ApiResponse(200, { analysis }, "OK"));
  } catch (error) {
    console.error("Stock analysis error:", error);
    throw new ApiError(500, "Failed to analyze stock");
  }
});

export { chatWithBot, analyzeStock };
