import React, { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "../../components/navbar/Navbar";
import { NavLink } from "react-router-dom";
import "./Home.css";
import { motion, useAnimation, useInView } from "framer-motion";
import { FaWallet, FaPiggyBank, FaFileInvoiceDollar, FaBullseye, FaArrowRight, FaChartPie, FaRocket, FaShieldAlt, FaChartLine, FaCoins, FaBell, FaFire } from "react-icons/fa";
import useAuthUser from "../../hooks/useAuthUser";
import { getOverAllBudget, getExpenseSummary, getAllSIPs, getBillsSummary } from "../../lib/api";

const AnimatedCounter = ({ value, suffix = "", prefix = "", decimals = 0 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1500;
    const step = Math.max(1, Math.floor(value / 60));
    const interval = setInterval(() => {
      start += step;
      if (start >= value) {
        setDisplay(value);
        clearInterval(interval);
      } else {
        setDisplay(start);
      }
    }, duration / 60);
    return () => clearInterval(interval);
  }, [inView, value]);

  return (
    <span ref={ref} className="home-ani-counter">
      {prefix}{display.toFixed(decimals)}{suffix}
    </span>
  );
};

const CircularProgress = ({ percentage, size = 100, strokeWidth = 8 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [progress, setProgress] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    if (!inView) return;
    let current = 0;
    const target = Math.min(percentage, 100);
    const interval = setInterval(() => {
      current += 1;
      if (current >= target) {
        setProgress(target);
        clearInterval(interval);
      } else {
        setProgress(current);
      }
    }, 20);
    return () => clearInterval(interval);
  }, [inView, percentage]);

  const color = percentage > 80 ? "#ef4444" : percentage > 50 ? "#f97316" : "#22c55e";

  return (
    <div ref={ref} className="home-circular-progress" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.1s ease" }}
        />
      </svg>
      <div className="home-circular-label">
        <AnimatedCounter value={percentage} suffix="%" decimals={0} />
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc, delay }) => (
  <motion.div
    className="home-feature-card"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ y: -5, scale: 1.02 }}
  >
    <div className="home-feature-icon">{icon}</div>
    <h4>{title}</h4>
    <p>{desc}</p>
  </motion.div>
);

const Home = () => {
  const { isAuthenticated, isLoading } = useAuthUser();
  const [liveData, setLiveData] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const mainRef = useRef(null);
  const mainInView = useInView(mainRef, { once: true });

  const fetchLiveData = useCallback(async () => {
    setDataLoading(true);
    try {
      const [budget, expenseSummary, sips, billsSummary] = await Promise.all([
        getOverAllBudget().catch(() => 0),
        getExpenseSummary("monthly").catch(() => ({ total: 0 })),
        getAllSIPs().catch(() => []),
        getBillsSummary().catch(() => ({ pending: { count: 0 } })),
      ]);
      const monthlyExpense = expenseSummary.total || 0;
      const budgetNum = budget || 0;
      const budgetUsed = budgetNum > 0 ? Math.round((monthlyExpense / budgetNum) * 100) : 0;
      const monthlySave = Math.max(0, budgetNum - monthlyExpense);
      setLiveData({
        budgetUsed,
        activeSIPs: Array.isArray(sips) ? sips.filter((s) => s.status !== "completed").length : 0,
        pendingBills: billsSummary?.pending?.count || 0,
        monthlySave,
      });
    } catch {
      setLiveData(null);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchLiveData();
  }, [isAuthenticated, fetchLiveData]);

  const stats = liveData || {
    budgetUsed: 68,
    activeSIPs: 12,
    pendingBills: 4,
    monthlySave: 18000,
  };

  const formatCurrency = (val) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val}`;
  };

  return (
    <div className="home-page">
      <motion.div initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
        <Navbar />
      </motion.div>

      <section className="home-hero">
        <div className="home-hero-bg" />
        <div className="home-hero-content">
          <motion.div
            className="home-hero-text"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="home-hero-chip"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <FaFire /> Smart Finance Tracking
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Take Control of Your{" "}
              <span className="home-gradient-text">Financial Life</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.6 }}
            >
              Track expenses, manage SIPs, pay bills, and achieve your financial goals — all in one powerful dashboard.
            </motion.p>
            <motion.div
              className="home-hero-actions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <NavLink to="/dashboard" className="home-btn-primary">
                Get Started Free <FaArrowRight />
              </NavLink>
              <NavLink to="/features" className="home-btn-secondary">
                Explore Features
              </NavLink>
            </motion.div>
          </motion.div>

          <motion.div
            className="home-hero-visual"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="home-analytics-wrapper" ref={mainRef}>
              <div className="home-analytics-panel">
                <div className="home-analytics-header">
                  <div className="home-analytics-chip">
                    <FaChartPie /> Live Insights
                  </div>
                  {isAuthenticated && !dataLoading && (
                    <button className="home-analytics-refresh" onClick={fetchLiveData} title="Refresh data">
                      <FaRocket />
                    </button>
                  )}
                </div>
                <h3>Your Financial Snapshot</h3>
                <div className="home-analytics-grid">
                  <motion.div
                    className="home-analytics-card budget"
                    whileHover={{ scale: 1.03, y: -2 }}
                  >
                    <div className="home-analytics-card-left">
                      <CircularProgress percentage={stats.budgetUsed} size={72} strokeWidth={6} />
                    </div>
                    <div className="home-analytics-card-right">
                      <span className="home-analytics-label">Budget Used</span>
                      <strong className="home-analytics-value">
                        <AnimatedCounter value={stats.budgetUsed} suffix="%" />
                      </strong>
                      <span className="home-analytics-sub">
                        {liveData ? `${formatCurrency(liveData.monthlySave + (liveData.budgetUsed > 0 ? Math.round((liveData.budgetUsed / 100) * (liveData.monthlySave / ((100 - liveData.budgetUsed) / 100))) / (liveData.budgetUsed / 100) : 0))} total` : "Track your spending"}
                      </span>
                    </div>
                  </motion.div>
                  <motion.div
                    className="home-analytics-card sips"
                    whileHover={{ scale: 1.03, y: -2 }}
                  >
                    <div className="home-analytics-card-icon">
                      <FaPiggyBank />
                    </div>
                    <div className="home-analytics-card-body">
                      <span className="home-analytics-label">Active SIPs</span>
                      <strong className="home-analytics-value">
                        <AnimatedCounter value={stats.activeSIPs} />
                      </strong>
                      <span className="home-analytics-sub">{liveData ? "Running" : "Systematic investments"}</span>
                    </div>
                  </motion.div>
                  <motion.div
                    className="home-analytics-card bills"
                    whileHover={{ scale: 1.03, y: -2 }}
                  >
                    <div className="home-analytics-card-icon">
                      <FaFileInvoiceDollar />
                    </div>
                    <div className="home-analytics-card-body">
                      <span className="home-analytics-label">Pending Bills</span>
                      <strong className="home-analytics-value">
                        <AnimatedCounter value={stats.pendingBills} />
                      </strong>
                      <span className="home-analytics-sub">{liveData ? "Due soon" : "Never miss a payment"}</span>
                    </div>
                  </motion.div>
                  <motion.div
                    className="home-analytics-card save"
                    whileHover={{ scale: 1.03, y: -2 }}
                  >
                    <div className="home-analytics-card-icon">
                      <FaCoins />
                    </div>
                    <div className="home-analytics-card-body">
                      <span className="home-analytics-label">Monthly Save</span>
                      <strong className="home-analytics-value">
                        <AnimatedCounter value={stats.monthlySave} prefix="₹" />
                      </strong>
                      <span className="home-analytics-sub">{liveData ? "Budget remaining" : "Start saving today"}</span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="home-features">
        <motion.div
          className="home-section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2>Everything You Need to <span className="home-gradient-text">Manage Your Money</span></h2>
          <p>Powerful tools to track, analyze, and optimize your personal finances</p>
        </motion.div>
        <div className="home-features-grid">
          <FeatureCard
            icon={<FaWallet />}
            title="Expense Tracking"
            desc="Log and categorize expenses with ease. Set budgets and get insights on your spending patterns."
            delay={0}
          />
          <FeatureCard
            icon={<FaChartLine />}
            title="SIP Management"
            desc="Track your mutual fund SIPs, view projected returns, and manage your investment portfolio."
            delay={0.1}
          />
          <FeatureCard
            icon={<FaBell />}
            title="Bill Reminders"
            desc="Never miss a payment. Get reminders for upcoming bills and keep your finances on track."
            delay={0.2}
          />
          <FeatureCard
            icon={<FaBullseye />}
            title="Goal Planning"
            desc="Set financial goals, track progress, and get estimated completion dates based on your savings."
            delay={0.3}
          />
          <FeatureCard
            icon={<FaShieldAlt />}
            title="Smart Insights"
            desc="AI-powered analysis of your finances with personalized recommendations to save more."
            delay={0.4}
          />
          <FeatureCard
            icon={<FaChartPie />}
            title="Visual Analytics"
            desc="Beautiful charts and graphs to visualize your income, expenses, and investment growth."
            delay={0.5}
          />
        </div>
      </section>

      <footer className="home-footer">
        <p>© 2026 ExTrackify. Take control of your finances.</p>
      </footer>
    </div>
  );
};

export default Home;
