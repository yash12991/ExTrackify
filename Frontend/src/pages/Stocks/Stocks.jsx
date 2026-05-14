import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaRupeeSign, FaChartLine, FaArrowLeft, FaRobot, FaPaperPlane, FaArrowUp, FaArrowDown, FaBuilding, FaExchangeAlt, FaChartBar, FaBullseye, FaUser } from "react-icons/fa";
import { createChart } from "lightweight-charts";
import { searchStocks, getStockQuote, getStockHistory, getMarketIndices, analyzeStock, sendBotMessage, getCompanyProfile, getStockNews, getTrendingStocks } from "../../lib/api";
import DashboardLayout from "../../components/layout/DashboardLayout";
import "./Stocks.css";

const PERIODS = [
  { value: "1d", label: "1D", interval: "15m" },
  { value: "5d", label: "5D", interval: "1h" },
  { value: "1mo", label: "1M", interval: "1d" },
  { value: "6mo", label: "6M", interval: "1d" },
  { value: "ytd", label: "YTD", interval: "1d" },
  { value: "1y", label: "1Y", interval: "1d" },
  { value: "5y", label: "5Y", interval: "1wk" },
  { value: "max", label: "MAX", interval: "1mo" },
];

const CHART_TYPES = [
  { value: "candlestick", label: "Candle", icon: <FaChartBar /> },
  { value: "line", label: "Line", icon: <FaChartLine /> },
  { value: "area", label: "Area", icon: <FaArrowUp /> },
];

const formatChartData = (historyData, chartType) => {
  const data = historyData?.data || [];
  if (!data.length) return [];
  const interval = historyData?.interval || "1d";
  const isIntraday = interval.includes("m") || interval.includes("h");
  return data.map((item) => {
    const time = isIntraday
      ? Math.floor(new Date(item.date).getTime() / 1000)
      : item.date.split("T")[0];
    if (chartType === "candlestick") {
      return { time, open: item.open, high: item.high, low: item.low, close: item.close };
    }
    return { time, value: item.close };
  });
};

const Stocks = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [indices, setIndices] = useState([]);
  const [indicesLoading, setIndicesLoading] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [quote, setQuote] = useState(null);
  const [history, setHistory] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [news, setNews] = useState([]);
  const [chartType, setChartType] = useState("candlestick");
  const [idlePeriod, setIdlePeriod] = useState("1mo");
  const [trendingStocks, setTrendingStocks] = useState([]);

  const debounceRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);
  const chartContainerRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const seriesRef = useRef(null);
  const pollingRef = useRef(null);
  const idlePeriodRef = useRef(idlePeriod);

  idlePeriodRef.current = idlePeriod;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    getMarketIndices()
      .then((res) => setIndices(res.data || []))
      .catch(() => {})
      .finally(() => setIndicesLoading(false));
    getTrendingStocks()
      .then((res) => setTrendingStocks(res.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.remove();
        chartInstanceRef.current = null;
        seriesRef.current = null;
      }
      if (pollingRef.current) {
        pollingRef.current.forEach((id) => clearInterval(id));
        pollingRef.current = null;
      }
    };
  }, []);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      pollingRef.current.forEach((id) => clearInterval(id));
      pollingRef.current = null;
    }
  }, []);

  const startPolling = useCallback((symbol) => {
    stopPolling();
    const intervals = [];

    const quotePoll = setInterval(async () => {
      try {
        const res = await getStockQuote(symbol);
        if (res?.data) setQuote(res.data);
      } catch {}
    }, 30000);
    intervals.push(quotePoll);

    const chartPoll = setInterval(async () => {
      try {
        const periodObj = PERIODS.find((p) => p.value === idlePeriodRef.current) || PERIODS[2];
        const res = await getStockHistory(symbol, idlePeriodRef.current, periodObj.interval);
        if (res?.data) {
          setHistory(res.data);
          const series = seriesRef.current;
          if (series) {
            const formatted = formatChartData(res.data, chartType);
            if (formatted.length) series.setData(formatted);
          }
        }
      } catch {}
    }, 60000);
    intervals.push(chartPoll);

    pollingRef.current = intervals;
  }, [chartType, stopPolling]);

  const initChart = useCallback((historyData) => {
    const container = chartContainerRef.current;
    if (!container) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.remove();
      chartInstanceRef.current = null;
      seriesRef.current = null;
    }

    const chart = createChart(container, {
      layout: {
        background: { color: "#ffffff" },
        textColor: "#2d1b0e",
      },
      grid: {
        vertLines: { color: "#f0e8e0" },
        horzLines: { color: "#f0e8e0" },
      },
      crosshair: { mode: 0 },
      rightPriceScale: { borderColor: "#e8e0d8" },
      timeScale: {
        borderColor: "#e8e0d8",
        timeVisible: true,
        secondsVisible: false,
      },
      width: container.clientWidth,
      height: container.clientHeight,
    });

    const handleResize = () => {
      if (chartInstanceRef.current && container) {
        chartInstanceRef.current.resize(container.clientWidth, container.clientHeight);
      }
    };
    window.addEventListener("resize", handleResize);

    const originalRemove = chart.remove.bind(chart);
    chart.remove = () => {
      window.removeEventListener("resize", handleResize);
      originalRemove();
    };

    chartInstanceRef.current = chart;

    const formatted = formatChartData(historyData, chartType);
    if (!formatted.length) return;

    const series = chartType === "candlestick"
      ? chart.addCandlestickSeries({
          upColor: "#16a34a",
          downColor: "#dc2626",
          borderUpColor: "#16a34a",
          borderDownColor: "#dc2626",
          wickUpColor: "#16a34a",
          wickDownColor: "#dc2626",
        })
      : chartType === "area"
      ? chart.addAreaSeries({
          lineColor: "#6366f1",
          topColor: "rgba(99, 102, 241, 0.3)",
          bottomColor: "rgba(99, 102, 241, 0.02)",
        })
      : chart.addLineSeries({
          color: "#6366f1",
          lineWidth: 2,
        });

    series.setData(formatted);
    seriesRef.current = series;
    chart.timeScale().fitContent();
  }, [chartType]);

  useEffect(() => {
    if (!selectedSymbol || detailLoading || !history?.data?.length) return;
    const timer = setTimeout(() => {
      initChart(history);
      startPolling(selectedSymbol);
    }, 50);
    return () => clearTimeout(timer);
  }, [selectedSymbol, detailLoading]);

  useEffect(() => {
    if (!selectedSymbol || !history?.data?.length) return;
    initChart(history);
  }, [chartType]);

  const handleSearch = useCallback((value, immediate = false) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length < 2) {
      setResults([]);
      return;
    }
    const doSearch = async () => {
      setLoading(true);
      try {
        const data = await searchStocks(value);
        setResults(data.data || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    };
    if (immediate) {
      doSearch();
    } else {
      debounceRef.current = setTimeout(doSearch, 400);
    }
  }, []);

  const runAnalysis = useCallback(async (symbol, q) => {
    if (!q) return;
    setAnalysisLoading(true);
    setAnalysis(null);
    try {
      const res = await analyzeStock(symbol, q);
      const text = res.data?.analysis || "Analysis unavailable.";
      setAnalysis(text);
      setChatMessages((prev) => [...prev, { role: "assistant", content: text }]);
    } catch {
      const err = "⚠️ AI analysis failed. Try again or ask a question below.";
      setAnalysis(err);
      setChatMessages((prev) => [...prev, { role: "assistant", content: err }]);
    } finally {
      setAnalysisLoading(false);
    }
  }, []);

  const handleSelectStock = async (symbol) => {
    stopPolling();
    if (chartInstanceRef.current) {
      chartInstanceRef.current.remove();
      chartInstanceRef.current = null;
      seriesRef.current = null;
    }

    setDetailLoading(true);
    setQuote(null);
    setHistory(null);
    setProfile(null);
    setAnalysis(null);
    setNews([]);
    setChatMessages([]);
    setIdlePeriod("1mo");

    const [qRes, hRes, pRes, nRes] = await Promise.all([
      getStockQuote(symbol).catch(() => null),
      getStockHistory(symbol, "1mo", "1d").catch(() => null),
      getCompanyProfile(symbol).catch(() => null),
      getStockNews(symbol).catch(() => ({ data: [] })),
    ]);

    if (qRes) {
      setQuote(qRes.data);
      runAnalysis(symbol, qRes.data);
    }
    if (hRes) setHistory(hRes.data);
    if (pRes) setProfile(pRes.data);
    setNews(nRes.data || []);
    setSelectedSymbol(symbol);
    setDetailLoading(false);
  };

  const handlePeriodChange = async (period) => {
    setIdlePeriod(period);
    const periodObj = PERIODS.find((p) => p.value === period) || PERIODS[2];
    try {
      const res = await getStockHistory(selectedSymbol, period, periodObj.interval);
      if (res?.data) {
        setHistory(res.data);
        const series = seriesRef.current;
        if (series) {
          const formatted = formatChartData(res.data, chartType);
          if (formatted.length) series.setData(formatted);
        }
      }
    } catch {}
  };

  const handleAnalyze = () => {
    if (!quote || analysisLoading) return;
    runAnalysis(selectedSymbol, quote);
  };

  const handleChatSend = async () => {
    const msg = chatInput.trim();
    if (!msg || chatLoading) return;
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", content: msg }]);
    setChatLoading(true);
    try {
      const context = quote
        ? `[Context: ${selectedSymbol} at \u20B9${quote.price} (${quote.changePercent}%) | Day: ${quote.dayLow}-${quote.dayHigh} | 52W: ${quote.yearLow}-${quote.yearHigh} | PE: ${quote.peRatio || "N/A"} | Vol: ${(quote.volume || 0).toLocaleString()}]\n\n${msg}`
        : msg;
      const data = await sendBotMessage(context);
      setChatMessages((prev) => [...prev, { role: "assistant", content: data.data.reply }]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I'm having trouble. Please try again." },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleBack = () => {
    stopPolling();
    if (chartInstanceRef.current) {
      chartInstanceRef.current.remove();
      chartInstanceRef.current = null;
      seriesRef.current = null;
    }
    setSelectedSymbol(null);
    setQuote(null);
    setHistory(null);
    setProfile(null);
    setAnalysis(null);
    setChatMessages([]);
  };

  return (
    <DashboardLayout>
      <div className="stocks-page">
        {!selectedSymbol ? (
          <>
            <motion.div className="stocks-header" initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }}>
              <div className="stocks-header-text">
                <h1><FaChartLine className="stocks-header-icon" /> Stock Market Explorer</h1>
                <p>Real-time Indian stock data, candlestick & line charts, AI-powered analysis</p>
              </div>
            </motion.div>

            <div className="stocks-indices">
              {indicesLoading ? (
                <div className="stocks-indices-loading">Loading indices...</div>
              ) : (
                indices.map((idx) => (
                  <motion.div
                    key={idx.symbol}
                    className="stocks-indices-card"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -2 }}
                  >
                    <div className="stocks-indices-name">{idx.name}</div>
                    <div className="stocks-indices-price">
                      <FaRupeeSign />{idx.price?.toLocaleString()}
                    </div>
                    <div className={`stocks-indices-change ${idx.change >= 0 ? "up" : "down"}`}>
                      {idx.change >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                      {Math.abs(idx.changePercent)?.toFixed(2)}%
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            <div className="stocks-search-bar">
              <FaSearch className="stocks-search-icon" />
              <input
                type="text"
                className="stocks-search-input"
                placeholder="Search NSE/BSE stocks by name or symbol (e.g. TCS, RELIANCE, HDFCBANK)..."
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                autoFocus
              />
              {loading && <div className="stocks-search-spinner" />}
            </div>

            <div className="stocks-results">
              <AnimatePresence>
                {results.map((stock, i) => (
                  <motion.div
                    key={stock.symbol}
                    className="stocks-card"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => handleSelectStock(stock.symbol)}
                    whileHover={{ y: -2 }}
                  >
                    <div className="stocks-card-top">
                      <div className="stocks-card-name">{stock.name}</div>
                      <div className="stocks-card-symbol">{stock.symbol}</div>
                    </div>
                    <div className="stocks-card-meta">
                      <span><FaExchangeAlt /> {stock.exchange}</span>
                      <span><FaBuilding /> {stock.type}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {!loading && query.length >= 2 && results.length === 0 && (
                <div className="stocks-empty">No stocks found. Try a different search term.</div>
              )}

              {!query && trendingStocks.length > 0 && (
                <div className="stocks-suggestions">
                  <div className="stocks-suggestions-label">Trending stocks</div>
                  <div className="stocks-suggestions-list">
                    {trendingStocks.map((s) => (
                      <button
                        key={s.symbol}
                        className="stocks-suggestion-chip"
                        onClick={() => handleSearch(s.symbol.replace(".NS", "").replace(".BO", ""), true)}
                      >
                        {s.symbol.replace(".NS", "").replace(".BO", "")}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <motion.button
              className="stocks-back-btn"
              onClick={handleBack}
              whileHover={{ x: -3 }}
            >
              <FaArrowLeft /> Back to search
            </motion.button>

            {detailLoading ? (
              <div className="stocks-detail-loading">
                <div className="stocks-spinner" />
                <p>Loading stock data...</p>
              </div>
            ) : (
              <div className="stocks-detail">
                <motion.div className="stocks-detail-header" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div>
                    <h2>{selectedSymbol}</h2>
                    {quote && (
                      <div className="stocks-price-row">
                        <span className="stocks-price">
                          <FaRupeeSign />{quote.price?.toFixed(2)}
                        </span>
                        <span className={`stocks-change ${quote.change >= 0 ? "up" : "down"}`}>
                          {quote.change >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                          {quote.changePercent >= 0 ? "+" : ""}{quote.changePercent?.toFixed(2)}%
                        </span>
                        <span className="stocks-market-state">
                          {quote.marketState === "REGULAR" ? "Market Open" : quote.marketState === "PRE" ? "Pre-Market" : quote.marketState === "POST" ? "After-Hours" : "Closed"}
                        </span>
                      </div>
                    )}
                  </div>
                  <button className="stocks-analyze-btn" onClick={handleAnalyze} disabled={analysisLoading}>
                    <FaRobot /> {analysisLoading ? "Analyzing..." : "AI Analysis"}
                  </button>
                </motion.div>

                {quote && (
                  <div className="stocks-stats">
                    <motion.div className="stocks-stat-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                      <span className="stocks-stat-label">Day Range</span>
                      <span className="stocks-stat-value">
                        <FaChartBar /> ₹{quote.dayLow?.toFixed(2)} - ₹{quote.dayHigh?.toFixed(2)}
                      </span>
                    </motion.div>
                    <motion.div className="stocks-stat-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                      <span className="stocks-stat-label">52-Week Range</span>
                      <span className="stocks-stat-value">
                        <FaBullseye /> ₹{quote.yearLow?.toFixed(2)} - ₹{quote.yearHigh?.toFixed(2)}
                      </span>
                    </motion.div>
                    <motion.div className="stocks-stat-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                      <span className="stocks-stat-label">P/E Ratio</span>
                      <span className="stocks-stat-value">{quote.peRatio?.toFixed(2) || "N/A"}</span>
                    </motion.div>
                    <motion.div className="stocks-stat-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                      <span className="stocks-stat-label">Market Cap</span>
                      <span className="stocks-stat-value">
                        {quote.marketCap ? `₹${(quote.marketCap / 10000000).toFixed(2)}Cr` : "N/A"}
                      </span>
                    </motion.div>
                    <motion.div className="stocks-stat-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                      <span className="stocks-stat-label">Volume</span>
                      <span className="stocks-stat-value">{quote.volume?.toLocaleString() || "N/A"}</span>
                    </motion.div>
                    <motion.div className="stocks-stat-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                      <span className="stocks-stat-label">Dividend Yield</span>
                      <span className="stocks-stat-value">
                        {quote.dividendYield ? `${(quote.dividendYield * 100).toFixed(2)}%` : "N/A"}
                      </span>
                    </motion.div>
                  </div>
                )}

                {profile && (
                  <motion.div className="stocks-profile-section" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="stocks-profile-header">
                      <h3><FaBuilding /> {profile.companyName}</h3>
                      <span className="stocks-profile-sector">{profile.sector} / {profile.industry}</span>
                    </div>
                    {profile.businessSummary && (
                      <p className="stocks-profile-summary">{profile.businessSummary}</p>
                    )}
                    <div className="stocks-profile-stats">
                      {profile.marketCap && (
                        <div className="stocks-profile-stat">
                          <span className="stocks-profile-stat-label">Market Cap</span>
                          <span className="stocks-profile-stat-value">₹{(profile.marketCap / 10000000).toFixed(2)}Cr</span>
                        </div>
                      )}
                      {profile.enterpriseValue && (
                        <div className="stocks-profile-stat">
                          <span className="stocks-profile-stat-label">Enterprise Value</span>
                          <span className="stocks-profile-stat-value">₹{(profile.enterpriseValue / 10000000).toFixed(2)}Cr</span>
                        </div>
                      )}
                      {profile.forwardPE && (
                        <div className="stocks-profile-stat">
                          <span className="stocks-profile-stat-label">Forward P/E</span>
                          <span className="stocks-profile-stat-value">{profile.forwardPE.toFixed(2)}</span>
                        </div>
                      )}
                      {profile.beta && (
                        <div className="stocks-profile-stat">
                          <span className="stocks-profile-stat-label">Beta</span>
                          <span className="stocks-profile-stat-value">{profile.beta.toFixed(2)}</span>
                        </div>
                      )}
                      {profile.priceToBook && (
                        <div className="stocks-profile-stat">
                          <span className="stocks-profile-stat-label">Price/Book</span>
                          <span className="stocks-profile-stat-value">{profile.priceToBook.toFixed(2)}</span>
                        </div>
                      )}
                      {profile.earningsPerShare && (
                        <div className="stocks-profile-stat">
                          <span className="stocks-profile-stat-label">EPS</span>
                          <span className="stocks-profile-stat-value">₹{profile.earningsPerShare.toFixed(2)}</span>
                        </div>
                      )}
                      {profile.debtToEquity && (
                        <div className="stocks-profile-stat">
                          <span className="stocks-profile-stat-label">Debt/Equity</span>
                          <span className="stocks-profile-stat-value">{profile.debtToEquity.toFixed(2)}</span>
                        </div>
                      )}
                      {profile.returnOnEquity && (
                        <div className="stocks-profile-stat">
                          <span className="stocks-profile-stat-label">ROE</span>
                          <span className="stocks-profile-stat-value">{(profile.returnOnEquity * 100).toFixed(1)}%</span>
                        </div>
                      )}
                      {profile.profitMargin && (
                        <div className="stocks-profile-stat">
                          <span className="stocks-profile-stat-label">Profit Margin</span>
                          <span className="stocks-profile-stat-value">{(profile.profitMargin * 100).toFixed(1)}%</span>
                        </div>
                      )}
                      {profile.recommendation && (
                        <div className="stocks-profile-stat">
                          <span className="stocks-profile-stat-label">Analyst Rating</span>
                          <span className={`stocks-profile-stat-value stocks-rating-${profile.recommendation}`}>
                            {profile.recommendation === "buy" ? "Buy" : profile.recommendation === "strong_buy" ? "Strong Buy" : profile.recommendation === "hold" ? "Hold" : profile.recommendation === "sell" ? "Sell" : profile.recommendation === "strong_sell" ? "Strong Sell" : profile.recommendation}
                            {profile.targetMeanPrice && ` → ₹${profile.targetMeanPrice.toFixed(2)}`}
                          </span>
                        </div>
                      )}
                      {profile.dividendYield > 0 && (
                        <div className="stocks-profile-stat">
                          <span className="stocks-profile-stat-label">Dividend Yield</span>
                          <span className="stocks-profile-stat-value">{(profile.dividendYield * 100).toFixed(2)}%</span>
                        </div>
                      )}
                      {profile.website && (
                        <div className="stocks-profile-stat stocks-profile-stat--wide">
                          <span className="stocks-profile-stat-label">Website</span>
                          <a href={profile.website} target="_blank" rel="noopener noreferrer" className="stocks-profile-link">{profile.website}</a>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                <div className="stocks-chart-wrap">
                  <div className="stocks-chart-header">
                    <h3><FaChartLine /> Real-Time Chart</h3>
                    <div className="stocks-chart-controls">
                      <div className="stocks-chart-types">
                        {CHART_TYPES.map((t) => (
                          <button
                            key={t.value}
                            className={`stocks-chart-type-btn ${chartType === t.value ? "active" : ""}`}
                            onClick={() => setChartType(t.value)}
                          >
                            {t.icon} {t.label}
                          </button>
                        ))}
                      </div>
                      <div className="stocks-periods">
                        {PERIODS.map((p) => (
                          <button
                            key={p.value}
                            className={`stocks-period-btn ${idlePeriod === p.value ? "active" : ""}`}
                            onClick={() => handlePeriodChange(p.value)}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div ref={chartContainerRef} className="stocks-chart" />
                </div>

                {news.length > 0 && (
                  <motion.div className="stocks-news-section" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="stocks-news-header">
                      <h3><FaRobot /> Latest News</h3>
                    </div>
                    <div className="stocks-news-list">
                      {news.slice(0, 5).map((item, i) => (
                        <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" className="stocks-news-card">
                          <div className="stocks-news-title">{item.title}</div>
                          <div className="stocks-news-meta">
                            <span className="stocks-news-source">{item.source || item.publisher}</span>
                            {item.date && (
                              <span className="stocks-news-date">
                                {new Date(item.date).toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" })}
                              </span>
                            )}
                          </div>
                        </a>
                      ))}
                    </div>
                  </motion.div>
                )}

                <div className="stocks-chat-section">
                  <div className="stocks-chat-header">
                    <div className="stocks-chat-header-row">
                      <h3><FaRobot /> AI Analysis & Chat</h3>
                      <button className="stocks-analyze-btn stocks-analyze-btn--sm" onClick={handleAnalyze} disabled={analysisLoading}>
                        {analysisLoading ? "Analyzing..." : "Analyze"}
                      </button>
                    </div>
                  </div>
                  <div className="stocks-chat-messages">
                    {analysisLoading && !analysis && (
                      <div className="stocks-analysis-loading">
                        <div className="stocks-spinner" />
                        <p>Analyzing stock with AI...</p>
                      </div>
                    )}
                    {chatMessages.map((msg, i) => (
                      <div key={i} className={`stocks-chat-msg ${msg.role === "user" ? "user" : "ai"}`}>
                        <div className="stocks-chat-msg-avatar">
                          {msg.role === "user" ? <FaUser /> : <FaRobot />}
                        </div>
                        <div className="stocks-chat-msg-bubble">
                          <div dangerouslySetInnerHTML={{
                            __html: msg.content
                              .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                              .replace(/\n/g, "<br/>"),
                          }} />
                        </div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="stocks-chat-msg ai">
                        <div className="stocks-chat-msg-avatar"><FaRobot /></div>
                        <div className="stocks-chat-msg-bubble">
                          <div className="stocks-chat-typing">
                            <span className="stocks-chat-dot" />
                            <span className="stocks-chat-dot" />
                            <span className="stocks-chat-dot" />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                    {chatMessages.length === 0 && !analysisLoading && (
                      <div className="stocks-chat-hint">
                        <p>Click "Analyze" above to get AI analysis of {selectedSymbol}</p>
                        <div className="stocks-chat-suggestions">
                          {[
                            "What is the outlook for this stock?",
                            "Is this stock undervalued?",
                            "What are the key risks?",
                            "How does it compare to peers?",
                          ].map((s) => (
                            <button
                              key={s}
                              className="stocks-chat-suggestion"
                              onClick={() => {
                                setChatInput(s);
                                setTimeout(() => chatInputRef.current?.focus(), 50);
                              }}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="stocks-chat-input-bar">
                    <input
                      ref={chatInputRef}
                      type="text"
                      className="stocks-chat-input"
                      placeholder={`Ask about ${selectedSymbol}...`}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleChatSend()}
                      disabled={chatLoading}
                    />
                    <button
                      className="stocks-chat-send"
                      onClick={handleChatSend}
                      disabled={chatLoading || !chatInput.trim()}
                    >
                      <FaPaperPlane />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Stocks;
