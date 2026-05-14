import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaWallet, FaArrowUp, FaArrowDown, FaChartLine } from "react-icons/fa";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { calculateNetWorth, getNetWorthHistory } from "../../lib/api";
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
import "./NetWorth.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

const NetWorth = () => {
  const [netWorth, setNetWorth] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await getNetWorthHistory(period);
      setHistory(result.data?.history || []);
      setNetWorth(result.data || null);
    } catch (error) {
      console.error("Failed to fetch net worth data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = async () => {
    try {
      setCalculating(true);
      await calculateNetWorth();
      await fetchData();
    } catch (error) {
      console.error("Failed to calculate net worth:", error);
    } finally {
      setCalculating(false);
    }
  };

  const latest = netWorth || {};
  const currentNetWorth = latest.current || 0;
  const totalAssets = latest.totalAssets || 0;
  const totalLiabilities = latest.totalLiabilities || 0;
  const change = latest.change || 0;

  const chartLabels = history.map((h) => {
    const d = new Date(h.date);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  });
  const chartValues = history.map((h) => h.netWorth || 0);

  const chartConfig = {
    labels: chartLabels,
    datasets: [
      {
        label: "Net Worth",
        data: chartValues,
        borderColor: "#ea580c",
        backgroundColor: "rgba(234, 88, 12, 0.08)",
        fill: true,
        tension: 0.35,
        pointRadius: 3,
        pointBackgroundColor: "#ea580c",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        borderWidth: 2.5,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1e1e2f",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "#333",
        borderWidth: 1,
        callbacks: {
          label: (ctx) => `₹${ctx.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#94a3b8", maxTicksLimit: 8 },
        grid: { color: "rgba(255,255,255,0.04)" },
      },
      y: {
        ticks: {
          color: "#94a3b8",
          callback: (v) => `₹${v.toLocaleString()}`,
        },
        grid: { color: "rgba(255,255,255,0.04)" },
      },
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
  };

  const breakdowns = [
    { label: "Investments", value: latest.totalInvestments || 0, icon: FaChartLine },
    { label: "SIP Value", value: latest.totalSipValue || 0, icon: FaChartLine },
    { label: "Total Expenses", value: latest.totalExpenses || 0, icon: FaArrowDown },
    { label: "Total Bills", value: latest.totalBills || 0, icon: FaWallet },
  ];

  const periods = [
    { label: "7d", value: 7 },
    { label: "30d", value: 30 },
    { label: "90d", value: 90 },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="networth-loading">
          <div className="networth-spinner" />
          <p>Loading net worth data...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="networth-dashboard">
        {/* Header */}
        <motion.div
          className="networth-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="networth-header-left">
            <p className="networth-eyebrow">Financial Overview</p>
            <h1>Net Worth Tracker</h1>
            <p>Track your wealth accumulation over time</p>
          </div>
          <div className="networth-header-right">
            <div className="networth-period-selector">
              {periods.map((p) => (
                <button
                  key={p.value}
                  className={period === p.value ? "active" : ""}
                  onClick={() => setPeriod(p.value)}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <button
              className="networth-calc-btn"
              onClick={handleCalculate}
              disabled={calculating}
            >
              {calculating ? "Calculating..." : "Calculate Now"}
            </button>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          className="networth-summary-grid"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="networth-summary-card networth-highlight">
            <div className="networth-card-icon">
              <FaWallet />
            </div>
            <div className="networth-card-content">
              <h3>Current Net Worth</h3>
              <div className="networth-card-value">
                ₹{currentNetWorth.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="networth-summary-card">
            <div className="networth-card-icon networth-card-icon-green">
              <FaArrowUp />
            </div>
            <div className="networth-card-content">
              <h3>Total Assets</h3>
              <div className="networth-card-value">
                ₹{totalAssets.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="networth-summary-card">
            <div className="networth-card-icon networth-card-icon-red">
              <FaArrowDown />
            </div>
            <div className="networth-card-content">
              <h3>Total Liabilities</h3>
              <div className="networth-card-value">
                ₹{totalLiabilities.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="networth-summary-card">
            <div className="networth-card-icon networth-card-icon-indigo">
              <FaChartLine />
            </div>
            <div className="networth-card-content">
              <h3>Change (Last Snapshot)</h3>
              <div className={`networth-card-value ${change >= 0 ? "text-green" : "text-red"}`}>
                {change >= 0 ? "+" : ""}₹{change.toLocaleString()}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Chart */}
        <motion.div
          className="networth-chart-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2>Net Worth Over Time</h2>
          <div className="networth-chart-wrapper">
            {chartValues.length > 0 ? (
              <Line data={chartConfig} options={chartOptions} />
            ) : (
              <div className="networth-chart-empty">
                <FaChartLine />
                <p>No history data yet. Click "Calculate Now" to take your first snapshot.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Breakdown Cards */}
        <motion.div
          className="networth-breakdown-grid"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {breakdowns.map((b) => (
            <div key={b.label} className="networth-breakdown-card">
              <div className="networth-breakdown-icon">
                <b.icon />
              </div>
              <div className="networth-breakdown-content">
                <h3>{b.label}</h3>
                <div className="networth-breakdown-value">
                  ₹{b.value.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default NetWorth;
