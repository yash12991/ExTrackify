import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Portfolio } from "../models/portfolio.model.js";
import { getStockQuote, searchStocks } from "./stock.controller.js";
import { getFundDetails } from "./mf.controller.js";

const getPortfolio = asyncHandler(async (req, res) => {
  let portfolio = await Portfolio.findOne({ user: req.user._id });
  if (!portfolio) {
    portfolio = await Portfolio.create({ user: req.user._id, holdings: [] });
  }
  return res.status(200).json(new ApiResponse(200, portfolio, "OK"));
});

const addHolding = asyncHandler(async (req, res) => {
  const { type, symbol, schemeCode, schemeName, name, quantity, buyPrice, buyNav, totalInvested } = req.body;
  if (!type || !quantity || !totalInvested) {
    throw new ApiError(400, "type, quantity, and totalInvested are required");
  }

  let portfolio = await Portfolio.findOne({ user: req.user._id });
  if (!portfolio) {
    portfolio = await Portfolio.create({ user: req.user._id, holdings: [] });
  }

  const existingIndex = portfolio.holdings.findIndex((h) => {
    if (type === "stock") return h.type === "stock" && h.symbol === symbol;
    return h.type === "mutual_fund" && h.schemeCode === schemeCode;
  });

  const holding = { type, symbol, schemeCode, schemeName, name, quantity, buyPrice, buyNav, totalInvested };

  if (existingIndex >= 0) {
    portfolio.holdings[existingIndex] = { ...portfolio.holdings[existingIndex].toObject(), ...holding };
  } else {
    portfolio.holdings.push(holding);
  }

  await portfolio.save();
  return res.status(200).json(new ApiResponse(200, portfolio, "Holding added"));
});

const removeHolding = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const portfolio = await Portfolio.findOne({ user: req.user._id });
  if (!portfolio) throw new ApiError(404, "Portfolio not found");

  portfolio.holdings = portfolio.holdings.filter((_, i) => i.toString() !== id);
  await portfolio.save();
  return res.status(200).json(new ApiResponse(200, portfolio, "Holding removed"));
});

const refreshPortfolio = asyncHandler(async (req, res) => {
  const portfolio = await Portfolio.findOne({ user: req.user._id });
  if (!portfolio) throw new ApiError(404, "Portfolio not found");

  let totalInvested = 0;
  let totalCurrentValue = 0;

  for (const h of portfolio.holdings) {
    try {
      if (h.type === "stock" && h.symbol) {
        const sym = h.symbol.includes(".") ? h.symbol : `${h.symbol}.NS`;
        const q = await getStockQuote({ params: { symbol: sym } }, {
          status: () => ({ json: () => {} }),
          locals: { mock: true }
        });
      }
    } catch {}
  }

  portfolio.totalInvested = portfolio.holdings.reduce((s, h) => s + (h.totalInvested || 0), 0);
  portfolio.totalCurrentValue = portfolio.holdings.reduce((s, h) => s + (h.currentValue || h.totalInvested || 0), 0);
  portfolio.totalReturn = portfolio.totalCurrentValue - portfolio.totalInvested;
  portfolio.totalReturnPercent = portfolio.totalInvested > 0 ? (portfolio.totalReturn / portfolio.totalInvested) * 100 : 0;
  await portfolio.save();

  return res.status(200).json(new ApiResponse(200, portfolio, "Portfolio refreshed"));
});

const getPortfolioAnalytics = asyncHandler(async (req, res) => {
  const portfolio = await Portfolio.findOne({ user: req.user._id });
  if (!portfolio) {
    return res.status(200).json(new ApiResponse(200, {
      totalInvested: 0, totalCurrentValue: 0, totalReturn: 0, totalReturnPercent: 0,
      stockCount: 0, fundCount: 0,
    }, "OK"));
  }

  const analytics = {
    totalInvested: portfolio.totalInvested,
    totalCurrentValue: portfolio.totalCurrentValue,
    totalReturn: portfolio.totalReturn,
    totalReturnPercent: portfolio.totalReturnPercent,
    stockCount: portfolio.holdings.filter((h) => h.type === "stock").length,
    fundCount: portfolio.holdings.filter((h) => h.type === "mutual_fund").length,
    topHoldings: portfolio.holdings.sort((a, b) => (b.currentValue || 0) - (a.currentValue || 0)).slice(0, 5),
  };

  return res.status(200).json(new ApiResponse(200, analytics, "OK"));
});

export { getPortfolio, addHolding, removeHolding, refreshPortfolio, getPortfolioAnalytics };
