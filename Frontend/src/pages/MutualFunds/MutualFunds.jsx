import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaRupeeSign,
  FaChartLine,
  FaArrowLeft,
  FaPlus,
  FaBuilding,
  FaTags,
  FaCalendarAlt,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from "chart.js";
import {
  searchMutualFunds,
  getFundDetails,
  getFundNavHistory,
  getTrendingFunds,
} from "../../lib/api";
import DashboardLayout from "../../components/layout/DashboardLayout";
import "./MutualFunds.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
);

const MutualFunds = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFund, setSelectedFund] = useState(null);
  const [fundDetails, setFundDetails] = useState(null);
  const [navHistory, setNavHistory] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [trendingFunds, setTrendingFunds] = useState([]);
  const debounceRef = useRef(null);

  useEffect(() => {
    getTrendingFunds()
      .then((res) => setTrendingFunds(res.data || []))
      .catch(() => {});
  }, []);

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
        const data = await searchMutualFunds(value);
        const funds = data.data || [];
        const withDetails = await Promise.all(
          funds.slice(0, 20).map(async (f) => {
            try {
              const d = await getFundDetails(f.schemeCode);
              return { ...f, details: d.data };
            } catch {
              return f;
            }
          })
        );
        setResults(withDetails);
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

  const handleSelectFund = async (fund) => {
    setSelectedFund(fund);
    setDetailsLoading(true);
    setFundDetails(null);
    setNavHistory(null);

    try {
      const [details, nav] = await Promise.all([
        getFundDetails(fund.schemeCode),
        getFundNavHistory(fund.schemeCode),
      ]);
      setFundDetails(details.data);
      setNavHistory(nav.data?.navHistory || []);
    } catch {
      try {
        const d = await getFundDetails(fund.schemeCode);
        setFundDetails(d.data);
      } catch {}
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleStartSIP = (fund) => {
    navigate("/sip-dashboard", {
      state: { preselectedFund: { schemeCode: fund.schemeCode, schemeName: fund.schemeName } },
    });
  };

  const navChartData = navHistory
    ? {
        labels: navHistory.slice(-120).map((n) => n.date),
        datasets: [
          {
            label: "NAV",
            data: navHistory.slice(-120).map((n) => n.nav),
            borderColor: "#f97316",
            backgroundColor: "rgba(249, 115, 22, 0.08)",
            fill: true,
            tension: 0.3,
            pointRadius: 0,
            borderWidth: 2,
          },
        ],
      }
    : null;

  return (
    <DashboardLayout>
      <div className="mf-page">
        {!selectedFund ? (
          <>
            <motion.div
              className="mf-header"
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mf-header-text">
                <h1>
                  <FaChartLine className="mf-header-icon" />
                  Explore Mutual Funds
                </h1>
                <p>Search and compare mutual fund schemes from all AMCs in India</p>
              </div>
            </motion.div>

            <div className="mf-search-bar">
              <FaSearch className="mf-search-icon" />
              <input
                type="text"
                className="mf-search-input"
                placeholder="Search by fund name, AMC, or category..."
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                autoFocus
              />
              {loading && <div className="mf-search-spinner" />}
            </div>

            <div className="mf-results">
              <AnimatePresence>
                {results.map((fund, i) => (
                  <motion.div
                    key={fund.schemeCode}
                    className="mf-card"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => handleSelectFund(fund)}
                    whileHover={{ y: -2 }}
                  >
                    <div className="mf-card-top">
                      <div className="mf-card-name">{fund.schemeName}</div>
                      <div className="mf-card-code">#{fund.schemeCode}</div>
                    </div>
                    {fund.details && (
                      <div className="mf-card-meta">
                        <span>
                          <FaBuilding /> {fund.details.fund_house}
                        </span>
                        <span>
                          <FaTags /> {fund.details.scheme_category}
                        </span>
                      </div>
                    )}
                    {fund.details?.latestNav && (
                      <div className="mf-card-nav">
                        <span className="mf-card-nav-label">NAV</span>
                        <span className="mf-card-nav-value">
                          <FaRupeeSign />
                          {fund.details.latestNav.toFixed(2)}
                        </span>
                        <span className="mf-card-nav-date">
                          {fund.details.date}
                        </span>
                      </div>
                    )}
                    {fund.details?.returns && (
                      <div className="mf-card-returns">
                        {Object.entries(fund.details.returns).map(
                          ([period, ret]) => (
                            <span
                              key={period}
                              className={`mf-return-badge ${parseFloat(ret) >= 0 ? "up" : "down"}`}
                            >
                              {period} {parseFloat(ret) >= 0 ? "+" : ""}
                              {ret}%
                            </span>
                          )
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {!loading && query.length >= 2 && results.length === 0 && (
                <div className="mf-empty">No funds found. Try a different search term.</div>
              )}

              {!query && trendingFunds.length > 0 && (
                <div className="mf-suggestions">
                  <div className="mf-suggestions-label">Popular funds</div>
                  <div className="mf-suggestions-list">
                    {(() => {
                      const seen = new Set();
                      return trendingFunds.filter(f => {
                        if (seen.has(f.schemeCode)) return false;
                        seen.add(f.schemeCode);
                        return true;
                      }).slice(0, 12).map((f) => (
                      <button
                        key={f.schemeCode}
                        className="mf-suggestion-chip"
                        onClick={() => handleSearch(f.schemeName, true)}
                      >
                        {f.schemeName.length > 30 ? f.schemeName.slice(0, 30) + "..." : f.schemeName}
                      </button>
                      ));
                    })()}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <motion.button
              className="mf-back-btn"
              onClick={() => {
                setSelectedFund(null);
                setFundDetails(null);
                setNavHistory(null);
              }}
              whileHover={{ x: -3 }}
            >
              <FaArrowLeft /> Back to search
            </motion.button>

            {detailsLoading ? (
              <div className="mf-detail-loading">
                <div className="mf-spinner" />
                <p>Loading fund data...</p>
              </div>
            ) : (
              <motion.div
                className="mf-detail"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="mf-detail-header">
                  <div>
                    <h2>{selectedFund.schemeName}</h2>
                    {fundDetails && (
                      <div className="mf-detail-meta">
                        <span><FaBuilding /> {fundDetails.fund_house}</span>
                        <span><FaTags /> {fundDetails.scheme_category}</span>
                        <span>{fundDetails.scheme_type}</span>
                      </div>
                    )}
                  </div>
                  <button
                    className="mf-start-sip-btn"
                    onClick={() => handleStartSIP(selectedFund)}
                  >
                    <FaPlus /> Start SIP
                  </button>
                </div>

                {fundDetails && (
                  <div className="mf-detail-stats">
                    <div className="mf-stat-card">
                      <span className="mf-stat-label">Latest NAV</span>
                      <span className="mf-stat-value">
                        <FaRupeeSign />
                        {fundDetails.latestNav?.toFixed(4)}
                      </span>
                      <span className="mf-stat-sub">as of {fundDetails.date}</span>
                    </div>
                    {fundDetails.returns &&
                      Object.entries(fundDetails.returns).map(([period, ret]) => (
                        <div key={period} className="mf-stat-card">
                          <span className="mf-stat-label">{period} Return</span>
                          <span
                            className={`mf-stat-value ${parseFloat(ret) >= 0 ? "up" : "down"}`}
                          >
                            {parseFloat(ret) >= 0 ? "+" : ""}
                            {ret}%
                          </span>
                          <span className="mf-stat-sub">
                            {parseFloat(ret) >= 0 ? "Gain" : "Loss"}
                          </span>
                        </div>
                      ))}
                  </div>
                )}

                {navChartData && (
                  <div className="mf-chart-wrap">
                    <h3>
                      <FaChartLine /> NAV Performance (Last 120 days)
                    </h3>
                    <div className="mf-chart">
                      <Line
                        data={navChartData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { display: false },
                            tooltip: {
                              backgroundColor: "#2d1b0e",
                              titleColor: "#fff",
                              bodyColor: "#f97316",
                              cornerRadius: 8,
                              padding: 10,
                            },
                          },
                          scales: {
                            x: {
                              grid: { display: false },
                              ticks: {
                                maxTicksLimit: 10,
                                color: "#9a8a7a",
                                font: { size: 10 },
                              },
                            },
                            y: {
                              grid: { color: "rgba(0,0,0,0.05)" },
                              ticks: {
                                color: "#9a8a7a",
                                font: { size: 10 },
                                callback: (v) => `₹${v}`,
                              },
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                )}

                {fundDetails && (
                  <div className="mf-detail-actions">
                    <button
                      className="mf-start-sip-btn mf-start-sip-btn--lg"
                      onClick={() => handleStartSIP(selectedFund)}
                    >
                      <FaExternalLinkAlt /> Create SIP in this Fund
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MutualFunds;
