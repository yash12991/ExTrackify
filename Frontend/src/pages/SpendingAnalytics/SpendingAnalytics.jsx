import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaChartPie,
  FaChartBar,
  FaArrowUp,
  FaArrowDown,
  FaCalendarAlt,
} from "react-icons/fa";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getSpendingAnalytics, getMonthlyComparison } from "../../lib/api";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import "./SpendingAnalytics.css";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const CHART_COLORS = [
  "#ea580c", "#f97316", "#fbbf24", "#22c55e",
  "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6",
  "#e11d48", "#84cc16", "#06b6d4", "#a855f7",
];

const SpendingAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [analyticsData, comparisonData] = await Promise.all([
          getSpendingAnalytics(6),
          getMonthlyComparison(),
        ]);
        setAnalytics(analyticsData);
        setComparison(comparisonData);
      } catch (err) {
        console.error("Failed to fetch spending analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="spending-analytics">
          <div className="sa-loading">
            <div className="sa-spinner" />
            <p>Loading analytics...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const summary = analytics?.summary || {};
  const categoryData = analytics?.categoryBreakdown || [];
  const topExpenses = analytics?.topExpenses || [];
  const monthlyTrend = analytics?.monthlyTrend || [];
  const insights = analytics?.insights || {};

  const doughnutData = {
    labels: categoryData.map((c) => c.category),
    datasets: [
      {
        data: categoryData.map((c) => c.amount),
        backgroundColor: CHART_COLORS.slice(0, categoryData.length),
        borderWidth: 0,
        hoverOffset: 8,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: "68%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 16,
          usePointStyle: true,
          pointStyle: "circle",
          font: { size: 12 },
          color: "#94a3b8",
        },
      },
      tooltip: {
        backgroundColor: "#1e293b",
        titleColor: "#f1f5f9",
        bodyColor: "#cbd5e1",
        borderColor: "#334155",
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (ctx) => {
            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
            const pct = ((ctx.parsed / total) * 100).toFixed(1);
            return ` ${ctx.label}: \u20B9${ctx.parsed.toLocaleString()} (${pct}%)`;
          },
        },
      },
    },
  };

  const changePct = comparison?.changePercent ?? null;
  const isUp = changePct !== null && changePct > 0;

  return (
    <DashboardLayout>
      <div className="spending-analytics">
        <div className="sa-header">
          <div>
            <p className="sa-eyebrow">Spending Analytics</p>
            <h1>Spending Overview</h1>
            <p className="sa-subtitle">Detailed breakdown of your expenses over the last 6 months</p>
          </div>
        </div>

        <div className="sa-summary-grid">
          <motion.div className="sa-card" whileHover={{ scale: 1.02 }}>
            <div className="sa-card-icon total">
              <FaChartBar />
            </div>
            <div className="sa-card-body">
              <h3>Total Spent</h3>
              <p className="sa-card-value">
                \u20B9{(summary.totalSpent || 0).toLocaleString()}
              </p>
              <span className="sa-card-label">Last 6 months</span>
            </div>
          </motion.div>

          <motion.div className="sa-card" whileHover={{ scale: 1.02 }}>
            <div className="sa-card-icon avg">
              <FaCalendarAlt />
            </div>
            <div className="sa-card-body">
              <h3>Avg Daily</h3>
              <p className="sa-card-value">
                \u20B9{(summary.avgDaily || 0).toLocaleString()}
              </p>
              <span className="sa-card-label">Per day</span>
            </div>
          </motion.div>

          <motion.div className="sa-card" whileHover={{ scale: 1.02 }}>
            <div className="sa-card-icon avg-txn">
              <FaChartPie />
            </div>
            <div className="sa-card-body">
              <h3>Avg / Transaction</h3>
              <p className="sa-card-value">
                \u20B9{(summary.avgPerTransaction || 0).toLocaleString()}
              </p>
              <span className="sa-card-label">Per expense</span>
            </div>
          </motion.div>

          <motion.div className="sa-card" whileHover={{ scale: 1.02 }}>
            <div className="sa-card-icon top">
              <FaChartBar />
            </div>
            <div className="sa-card-body">
              <h3>Top Category</h3>
              <p className="sa-card-value">{summary.topCategory || "N/A"}</p>
              <span className="sa-card-label">
                {summary.topCategoryAmount
                  ? `\u20B9${summary.topCategoryAmount.toLocaleString()}`
                  : ""}
              </span>
            </div>
          </motion.div>
        </div>

        <div className="sa-two-col">
          <div className="sa-section">
            <h2 className="sa-section-title">
              <FaChartPie /> Category Breakdown
            </h2>
            <div className="sa-chart-wrapper">
              {categoryData.length > 0 ? (
                <Doughnut data={doughnutData} options={doughnutOptions} />
              ) : (
                <div className="sa-placeholder">No category data</div>
              )}
            </div>
          </div>

          <div className="sa-section">
            <h2 className="sa-section-title">
              <FaChartBar /> Monthly Comparison
            </h2>
            <div className="sa-comparison-card">
              {changePct !== null ? (
                <>
                  <div className="sa-comp-header">
                    <span className="sa-comp-label">Current vs Previous Month</span>
                    <span className={`sa-comp-badge ${isUp ? "up" : "down"}`}>
                      {isUp ? <FaArrowUp /> : <FaArrowDown />}
                      {Math.abs(changePct).toFixed(1)}%
                    </span>
                  </div>
                  <div className="sa-comp-bars">
                    <div className="sa-comp-bar-group">
                      <span className="sa-comp-bar-label">Previous</span>
                      <div className="sa-comp-bar-track">
                        <div
                          className="sa-comp-bar prev"
                          style={{
                            width: `${Math.min(
                              ((comparison?.previousMonth?.total || 0) /
                                Math.max(
                                  comparison?.currentMonth?.total || 1,
                                  comparison?.previousMonth?.total || 1
                                )) *
                                100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                      <span className="sa-comp-bar-value">
                        \u20B9{(comparison?.previousMonth?.total || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="sa-comp-bar-group">
                      <span className="sa-comp-bar-label">Current</span>
                      <div className="sa-comp-bar-track">
                        <div
                          className="sa-comp-bar curr"
                          style={{ width: "100%" }}
                        />
                      </div>
                      <span className="sa-comp-bar-value">
                        \u20B9{(comparison?.currentMonth?.total || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="sa-placeholder">No comparison data</div>
              )}
            </div>
          </div>
        </div>

        <div className="sa-two-col">
          <div className="sa-section">
            <h2 className="sa-section-title">
              <FaChartBar /> Top Expenses
            </h2>
            <div className="sa-top-expenses">
              {topExpenses.length > 0 ? (
                topExpenses.slice(0, 10).map((exp, i) => (
                  <div key={exp._id || i} className="sa-top-item">
                    <span className="sa-top-rank">#{i + 1}</span>
                    <div className="sa-top-info">
                      <span className="sa-top-category">{exp.category}</span>
                      {exp.notes && (
                        <span className="sa-top-notes">{exp.notes}</span>
                      )}
                    </div>
                    <span className="sa-top-amount">
                      \u20B9{exp.amount.toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="sa-placeholder">No expenses recorded</div>
              )}
            </div>
          </div>

          <div className="sa-section">
            <h2 className="sa-section-title">Key Insights</h2>
            <div className="sa-insights-grid">
              <div className="sa-insight-card">
                <span className="sa-insight-label">Top Category</span>
                <span className="sa-insight-value">
                  {insights.topCategoryPercent
                    ? `${insights.topCategoryPercent.toFixed(1)}%`
                    : "N/A"}
                </span>
              </div>
              <div className="sa-insight-card">
                <span className="sa-insight-label">Total Transactions</span>
                <span className="sa-insight-value">
                  {insights.totalTransactions ?? analytics?.totalTransactions ?? 0}
                </span>
              </div>
              <div className="sa-insight-card">
                <span className="sa-insight-label">Bills Paid</span>
                <span className="sa-insight-value">
                  {insights.billsPaid ?? 0}
                </span>
              </div>
              <div className="sa-insight-card">
                <span className="sa-insight-label">SIP Investments</span>
                <span className="sa-insight-value">
                  \u20B9{(insights.sipInvestments || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {monthlyTrend.length > 0 && (
          <div className="sa-section">
            <h2 className="sa-section-title">
              <FaCalendarAlt /> Monthly Trend
            </h2>
            <div className="sa-trend-grid">
              {monthlyTrend.map((m, i) => (
                <div key={i} className="sa-trend-bar-group">
                  <div className="sa-trend-bar-wrapper">
                    <div
                      className="sa-trend-bar"
                      style={{
                        height: `${Math.min(
                          (m.total /
                            Math.max(...monthlyTrend.map((x) => x.total))) *
                            100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                  <span className="sa-trend-label">
                    {new Date(m.year, m.month - 1).toLocaleString("default", {
                      month: "short",
                    })}
                  </span>
                  <span className="sa-trend-value">
                    \u20B9{m.total.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SpendingAnalytics;
