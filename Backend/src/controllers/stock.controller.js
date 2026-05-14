import YahooFinance from "yahoo-finance2";
const yahooFinance = new YahooFinance();
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

const withTimeout = (promise, ms = 8000) =>
  Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms)),
  ]);

const toNseSymbol = (query) => {
  const cleaned = query.trim().toUpperCase();
  if (cleaned.endsWith(".NS") || cleaned.endsWith(".BO")) return cleaned;
  return `${cleaned}.NS`;
};

const searchStocks = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 1) {
    throw new ApiError(400, "Search query is required");
  }

  try {
    const results = await withTimeout(yahooFinance.search(q, {
      quotesCount: 20,
      newsCount: 0,
      enableNavLinks: false,
    }), 8000);

    const isIndian = (q) => {
      if (!q.symbol) return false;
      if (q.exchange === "NSI" || q.exchange === "BSE" || q.exchange === "NSE") return true;
      const sym = q.symbol.toUpperCase();
      if (sym.endsWith(".NS") || sym.endsWith(".BO")) return true;
      return false;
    };

    const quotes = (results.quotes || [])
      .filter(isIndian)
      .map((q) => ({
        symbol: q.symbol,
        name: q.shortname || q.longname || q.symbol,
        exchange: q.exchange || (q.symbol.endsWith(".NS") ? "NSE" : q.symbol.endsWith(".BO") ? "BSE" : "NSE"),
        type: q.quoteType || "EQUITY",
        score: q.score,
      }));

    if (quotes.length === 0) {
      return res.status(200).json(new ApiResponse(200, [], "No Indian stocks found"));
    }

    return res.status(200).json(new ApiResponse(200, quotes, "OK"));
  } catch (error) {
    console.error("Stock search error:", error.message);
    throw new ApiError(502, "Failed to search stocks");
  }
});

const getStockQuote = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  if (!symbol) throw new ApiError(400, "Symbol is required");

  try {
    const nseSymbol = toNseSymbol(symbol);
    const quote = await withTimeout(yahooFinance.quote(nseSymbol), 8000);

    const result = {
      symbol: quote.symbol,
      name: quote.shortName || quote.longName || nseSymbol,
      price: quote.regularMarketPrice,
      previousClose: quote.regularMarketPreviousClose,
      change: quote.regularMarketChange,
      changePercent: quote.regularMarketChangePercent,
      dayHigh: quote.regularMarketDayHigh,
      dayLow: quote.regularMarketDayLow,
      volume: quote.regularMarketVolume,
      avgVolume: quote.averageDailyVolume3Month || quote.averageDailyVolume10Day,
      marketCap: quote.marketCap,
      peRatio: quote.trailingPE,
      dividendYield: quote.dividendYield,
      yearHigh: quote.fiftyTwoWeekHigh,
      yearLow: quote.fiftyTwoWeekLow,
      open: quote.regularMarketOpen,
      currency: quote.currency || "INR",
      marketState: quote.marketState,
      timestamp: quote.regularMarketTime,
    };

    return res.status(200).json(new ApiResponse(200, result, "OK"));
  } catch (error) {
    console.error("Stock quote error:", error.message);
    throw new ApiError(502, `Failed to fetch quote for ${symbol}`);
  }
});

const getStockHistory = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const { period = "1mo", interval = "1d" } = req.query;
  if (!symbol) throw new ApiError(400, "Symbol is required");

  const periodMap = {
    "1d": { days: 1 },
    "5d": { days: 5 },
    "1mo": { months: 1 },
    "3mo": { months: 3 },
    "6mo": { months: 6 },
    "ytd": { ytd: true },
    "1y": { years: 1 },
    "2y": { years: 2 },
    "5y": { years: 5 },
    max: { years: 20 },
  };

  const p = periodMap[period] || { months: 1 };
  const now = new Date();
  const period1 = new Date(now);

  if (p.ytd) period1.setMonth(0, 1);
  else if (p.days) period1.setDate(period1.getDate() - p.days);
  else if (p.months) period1.setMonth(period1.getMonth() - p.months);
  else if (p.years) period1.setFullYear(period1.getFullYear() - p.years);

  try {
    const nseSymbol = toNseSymbol(symbol);
    const chart = await withTimeout(yahooFinance.chart(nseSymbol, {
      period1: period1,
      period2: now,
      interval: interval,
    }), 10000);

    const quotes = chart?.quotes || [];

    if (!quotes.length) {
      return res.status(200).json(new ApiResponse(200, { symbol: nseSymbol, period, interval, data: [] }, "No history data"));
    }

    const result = {
      symbol: nseSymbol,
      period,
      interval,
      data: quotes
        .filter((q) => q.close !== null)
        .map((q) => ({
          date: q.date,
          open: q.open,
          high: q.high,
          low: q.low,
          close: q.close,
          volume: q.volume,
        })),
    };

    return res.status(200).json(new ApiResponse(200, result, "OK"));
  } catch (error) {
    console.error("Stock history error:", error.message);
    throw new ApiError(502, `Failed to fetch history for ${symbol}`);
  }
});

const getMarketIndices = asyncHandler(async (req, res) => {
  const indices = ["^NSEI", "^BSESN", "^NSEBANK"];
  try {
    const results = await Promise.allSettled(
      indices.map((sym) => withTimeout(yahooFinance.quote(sym), 6000).catch((e) => {
        console.error(`Indices fetch error for ${sym}:`, e.message);
        return null;
      }))
    );
    const data = results
      .filter((r) => r.status === "fulfilled" && r.value)
      .map((r) => r.value)
      .filter((q) => q)
      .map((q) => ({
        symbol: q.symbol,
        name: q.shortName || q.longName,
        price: q.regularMarketPrice,
        change: q.regularMarketChange,
        changePercent: q.regularMarketChangePercent,
        open: q.regularMarketOpen,
        dayHigh: q.regularMarketDayHigh,
        dayLow: q.regularMarketDayLow,
        previousClose: q.regularMarketPreviousClose,
        volume: q.regularMarketVolume,
      }));

    return res.status(200).json(new ApiResponse(200, data, "OK"));
  } catch (error) {
    console.error("Market indices error:", error.message);
    throw new ApiError(502, "Failed to fetch market indices");
  }
});

const getCompanyProfile = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  if (!symbol) throw new ApiError(400, "Symbol is required");

  try {
    const nseSymbol = toNseSymbol(symbol);
    const summary = await withTimeout(yahooFinance.quoteSummary(nseSymbol, {
      modules: ["assetProfile", "financialData", "defaultKeyStatistics", "summaryDetail"],
    }), 10000);

    const profile = {
      symbol: nseSymbol,
      companyName: summary.assetProfile?.companyName || summary.assetProfile?.shortName || nseSymbol,
      sector: summary.assetProfile?.sector || "N/A",
      industry: summary.assetProfile?.industry || "N/A",
      website: summary.assetProfile?.website || null,
      businessSummary: summary.assetProfile?.longBusinessSummary || null,
      country: summary.assetProfile?.country || "India",
      employees: summary.assetProfile?.fullTimeEmployees || null,
      marketCap: summary.defaultKeyStatistics?.marketCap?.raw || null,
      enterpriseValue: summary.defaultKeyStatistics?.enterpriseValue?.raw || null,
      forwardPE: summary.defaultKeyStatistics?.forwardPE?.raw || null,
      trailingPE: summary.defaultKeyStatistics?.trailingPE?.raw || summary.defaultKeyStatistics?.forwardPE?.raw || null,
      profitMargin: summary.defaultKeyStatistics?.profitMargins?.raw || null,
      beta: summary.defaultKeyStatistics?.beta?.raw || null,
      bookValue: summary.defaultKeyStatistics?.bookValue?.raw || null,
      priceToBook: summary.defaultKeyStatistics?.priceToBook?.raw || null,
      earningsPerShare: summary.defaultKeyStatistics?.trailingEps?.raw || null,
      dividendYield: summary.defaultKeyStatistics?.dividendYield?.raw || null,
      sharesOutstanding: summary.defaultKeyStatistics?.sharesOutstanding?.raw || null,
      heldPercentInstitutions: summary.defaultKeyStatistics?.heldPercentInstitutions?.raw || null,
      revenue: summary.financialData?.totalRevenue?.raw || null,
      revenueGrowth: summary.financialData?.revenueGrowth?.raw || null,
      grossProfitMargin: summary.financialData?.grossMargins?.raw || null,
      operatingMargin: summary.financialData?.operatingMargins?.raw || null,
      returnOnEquity: summary.financialData?.returnOnEquity?.raw || null,
      debtToEquity: summary.financialData?.debtToEquity?.raw || null,
      quickRatio: summary.financialData?.quickRatio?.raw || null,
      currentRatio: summary.financialData?.currentRatio?.raw || null,
      targetMeanPrice: summary.financialData?.targetMeanPrice?.raw || null,
      recommendation: summary.financialData?.recommendationKey || null,
      recommendationMean: summary.financialData?.recommendationMean?.raw || null,
    };

    return res.status(200).json(new ApiResponse(200, profile, "OK"));
  } catch (error) {
    console.error("Company profile error:", error.message);
    throw new ApiError(502, `Failed to fetch profile for ${symbol}`);
  }
});

const getTrendingStocks = asyncHandler(async (req, res) => {
  try {
    const { quotes } = await withTimeout(yahooFinance.trendingSymbols("IN", { count: 10 }), 8000);
    const stocks = (quotes || [])
      .filter((q) => q.symbol)
      .map((q) => ({
        symbol: q.symbol,
        name: q.shortName || q.longName || q.symbol,
        exchange: q.exchange || "NSE",
      }));
    return res.status(200).json(new ApiResponse(200, stocks, "OK"));
  } catch (error) {
    console.error("Trending stocks error:", error.message);
    const fallback = [
      { symbol: "RELIANCE.NS", name: "Reliance Industries Ltd", exchange: "NSE" },
      { symbol: "TCS.NS", name: "Tata Consultancy Services Ltd", exchange: "NSE" },
      { symbol: "HDFCBANK.NS", name: "HDFC Bank Ltd", exchange: "NSE" },
      { symbol: "INFY.NS", name: "Infosys Ltd", exchange: "NSE" },
      { symbol: "ICICIBANK.NS", name: "ICICI Bank Ltd", exchange: "NSE" },
    ];
    return res.status(200).json(new ApiResponse(200, fallback, "OK"));
  }
});

const getStockNews = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  if (!symbol) throw new ApiError(400, "Symbol is required");

  try {
    const nseSymbol = toNseSymbol(symbol);

    const [insightsResult, searchResult] = await Promise.all([
      withTimeout(yahooFinance.insights(nseSymbol), 8000).catch(() => ({ sigDevs: [] })),
      withTimeout(yahooFinance.search(nseSymbol, { quotesCount: 0, newsCount: 10 }), 8000).catch(() => ({ news: [] })),
    ]);

    const news = [];

    if (insightsResult.sigDevs?.length) {
      insightsResult.sigDevs.forEach((d) => {
        if (d.headline) {
          news.push({
            title: d.headline,
            date: d.date,
            source: "Yahoo Finance",
            type: "development",
          });
        }
      });
    }

    if (searchResult.news?.length) {
      const companyName = searchResult.quotes?.[0]?.shortname || "";
      searchResult.news.forEach((n) => {
        if (n.title && !news.some((existing) => existing.title === n.title)) {
          news.push({
            title: n.title,
            link: n.link,
            publisher: n.publisher || "Yahoo Finance",
            date: n.providerPublishTime ? new Date(n.providerPublishTime * 1000).toISOString() : null,
            type: "news",
          });
        }
      });
    }

    return res.status(200).json(new ApiResponse(200, news.slice(0, 15), "OK"));
  } catch (error) {
    console.error("Stock news error:", error.message);
    throw new ApiError(502, `Failed to fetch news for ${symbol}`);
  }
});

export { searchStocks, getStockQuote, getStockHistory, getMarketIndices, getCompanyProfile, getStockNews, getTrendingStocks };
