import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaWallet,
  FaPlus,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimes,
  FaTrash,
  FaChartPie,
} from "react-icons/fa";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  getBudget,
  setOrUpdateBudget,
  getBudgetStatus,
  getBudgetAlerts,
  getOverAllBudget,
  updateOverallBudget,
} from "../../lib/api";
import "./BudgetManagement.css";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const PREDEFINED_CATEGORIES = [
  "Food", "Transport", "Housing", "Utilities",
  "Healthcare", "Entertainment", "Shopping", "Other",
];

const BudgetManagement = () => {
  const now = new Date();
  const currentMonth = MONTH_NAMES[now.getMonth()];
  const currentYear = now.getFullYear();

  const [overallBudget, setOverallBudget] = useState(0);
  const [overallFormOpen, setOverallFormOpen] = useState(false);
  const [overallAmount, setOverallAmount] = useState("");
  const [budgetStatus, setBudgetStatus] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [budgetFormOpen, setBudgetFormOpen] = useState(false);
  const [budgetForm, setBudgetForm] = useState({ category: "", amount: "" });
  const [submitting, setSubmitting] = useState(false);

  const totals = budgetStatus.reduce(
    (acc, b) => ({
      budget: acc.budget + (b.budgetAmount || 0),
      spent: acc.spent + (b.spentAmount || 0),
    }),
    { budget: 0, spent: 0 }
  );
  const remaining = totals.budget - totals.spent;

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [overall, status, alertsData] = await Promise.all([
        getOverAllBudget(),
        getBudgetStatus(),
        getBudgetAlerts(),
      ]);
      setOverallBudget(overall);
      const statusData = status?.data || status || [];
      setBudgetStatus(Array.isArray(statusData) ? statusData : []);
      const alertList = alertsData?.data || alertsData?.alerts || alertsData || [];
      setAlerts(Array.isArray(alertList) ? alertList : []);
    } catch (err) {
      console.error("Error fetching budget data:", err);
      setError(err.message || "Failed to load budget data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOverallSubmit = async () => {
    const amount = Number(overallAmount);
    if (!amount || amount <= 0) return;
    setSubmitting(true);
    try {
      await updateOverallBudget(amount);
      setOverallBudget(amount);
      setOverallFormOpen(false);
      setOverallAmount("");
    } catch (err) {
      console.error("Failed to update overall budget:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCategoryBudgetSubmit = async () => {
    if (!budgetForm.category || !Number(budgetForm.amount) || Number(budgetForm.amount) <= 0) return;
    setSubmitting(true);
    try {
      await setOrUpdateBudget({
        category: budgetForm.category,
        amount: Number(budgetForm.amount),
      });
      setBudgetFormOpen(false);
      setBudgetForm({ category: "", amount: "" });
      fetchData();
    } catch (err) {
      console.error("Failed to set category budget:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const dismissAlert = (id) => {
    setDismissedAlerts((prev) => new Set([...prev, id]));
  };

  const getProgressColor = (spent, budgetAmount) => {
    if (!budgetAmount) return "#6366f1";
    const pct = (spent / budgetAmount) * 100;
    if (pct >= 100) return "#ef4444";
    if (pct >= 80) return "#f97316";
    return "#22c55e";
  };

  const getProgressPercent = (spent, budgetAmount) => {
    if (!budgetAmount) return 0;
    return Math.min(100, (spent / budgetAmount) * 100);
  };

  const visibleAlerts = alerts.filter((a) => !dismissedAlerts.has(a._id || a.id));

  return (
    <DashboardLayout>
      <div className="budget-page">
        <header className="budget-header">
          <div className="budget-header-left">
            <p className="budget-eyebrow">Budget Management</p>
            <h1>
              <FaWallet className="budget-title-icon" />
              {currentMonth} {currentYear}
            </h1>
            <p className="budget-header-subtitle">
              Track and manage your spending limits
            </p>
          </div>
          <div className="budget-header-actions">
            <button
              className="budget-add-btn"
              onClick={() => setBudgetFormOpen(true)}
            >
              <FaPlus /> Category Budget
            </button>
            <button
              className="budget-overall-btn"
              onClick={() => {
                setOverallAmount(String(overallBudget));
                setOverallFormOpen(true);
              }}
            >
              <FaWallet /> Overall Budget
            </button>
          </div>
        </header>

        {error && (
          <div className="budget-error-banner">
            <FaExclamationTriangle />
            <span>{error}</span>
            <button onClick={fetchData}>Retry</button>
          </div>
        )}

        <div className="budget-summary-cards">
          <motion.div
            className="budget-summary-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <div className="budget-summary-icon total">
              <FaWallet />
            </div>
            <div className="budget-summary-content">
              <h3>Total Budget</h3>
              <p className="budget-summary-amount">
                ₹{totals.budget.toLocaleString()}
              </p>
            </div>
          </motion.div>

          <motion.div
            className="budget-summary-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="budget-summary-icon spent">
              <FaChartPie />
            </div>
            <div className="budget-summary-content">
              <h3>Total Spent</h3>
              <p className="budget-summary-amount">
                ₹{totals.spent.toLocaleString()}
              </p>
            </div>
          </motion.div>

          <motion.div
            className="budget-summary-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className={`budget-summary-icon ${remaining >= 0 ? "remaining" : "over"}`}>
              {remaining >= 0 ? <FaCheckCircle /> : <FaExclamationTriangle />}
            </div>
            <div className="budget-summary-content">
              <h3>{remaining >= 0 ? "Remaining" : "Over Budget"}</h3>
              <p className="budget-summary-amount">
                ₹{Math.abs(remaining).toLocaleString()}
              </p>
            </div>
          </motion.div>

          <motion.div
            className="budget-summary-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="budget-summary-icon categories">
              <FaChartPie />
            </div>
            <div className="budget-summary-content">
              <h3>Categories</h3>
              <p className="budget-summary-amount">{budgetStatus.length}</p>
            </div>
          </motion.div>
        </div>

        <div className="budget-grid">
          <div className="budget-section overall-section">
            <div className="budget-section-header">
              <h2><FaWallet /> Overall Budget</h2>
              <button
                className="budget-section-action"
                onClick={() => {
                  setOverallAmount(String(overallBudget));
                  setOverallFormOpen(true);
                }}
              >
                {overallBudget > 0 ? "Update" : "Set Budget"}
              </button>
            </div>
            {overallBudget > 0 ? (
              <div className="overall-budget-display">
                <div className="overall-budget-row">
                  <span className="overall-label">Monthly Budget</span>
                  <span className="overall-value">₹{overallBudget.toLocaleString()}</span>
                </div>
                <div className="overall-budget-row">
                  <span className="overall-label">Spent</span>
                  <span className="overall-value spent">₹{totals.spent.toLocaleString()}</span>
                </div>
                <div className="overall-budget-row">
                  <span className="overall-label">{remaining >= 0 ? "Remaining" : "Over"}</span>
                  <span className={`overall-value ${remaining >= 0 ? "remaining" : "over"}`}>
                    ₹{Math.abs(remaining).toLocaleString()}
                  </span>
                </div>
                <div className="overall-progress">
                  <div
                    className="overall-progress-bar"
                    style={{
                      width: `${getProgressPercent(totals.spent, overallBudget)}%`,
                      background: getProgressColor(totals.spent, overallBudget),
                    }}
                  />
                </div>
                <span className="overall-percent">
                  {getProgressPercent(totals.spent, overallBudget).toFixed(1)}% used
                </span>
              </div>
            ) : (
              <div className="overall-empty">
                <p>No overall budget set yet.</p>
                <button onClick={() => setOverallFormOpen(true)}>
                  <FaPlus /> Set Overall Budget
                </button>
              </div>
            )}
          </div>

          <div className="budget-section categories-section">
            <div className="budget-section-header">
              <h2><FaChartPie /> Category Budgets</h2>
              <button
                className="budget-section-action"
                onClick={() => setBudgetFormOpen(true)}
              >
                <FaPlus /> Add
              </button>
            </div>
            {budgetStatus.length > 0 ? (
              <div className="category-budgets-list">
                {budgetStatus.map((b, i) => {
                  const pct = getProgressPercent(b.spentAmount, b.budgetAmount);
                  const color = getProgressColor(b.spentAmount, b.budgetAmount);
                  return (
                    <motion.div
                      key={b._id || b.category || i}
                      className="category-budget-item"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <div className="category-budget-header">
                        <span className="category-budget-name">{b.category}</span>
                        <span className="category-budget-amounts">
                          ₹{b.spentAmount?.toLocaleString() || 0} / ₹{b.budgetAmount?.toLocaleString() || 0}
                        </span>
                      </div>
                      <div className="category-progress-track">
                        <div
                          className="category-progress-fill"
                          style={{ width: `${pct}%`, background: color }}
                        />
                      </div>
                      <div className="category-budget-footer">
                        <span className="category-budget-remaining" style={{ color }}>
                          {pct >= 100 ? "Exceeded" : `₹${Math.max(0, (b.budgetAmount || 0) - (b.spentAmount || 0)).toLocaleString()} left`}
                        </span>
                        <span className="category-budget-pct" style={{ color }}>
                          {pct.toFixed(1)}%
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="category-empty">
                <FaChartPie className="category-empty-icon" />
                <p>No category budgets set.</p>
                <button onClick={() => setBudgetFormOpen(true)}>
                  <FaPlus /> Add Category Budget
                </button>
              </div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {visibleAlerts.length > 0 && (
            <motion.section
              className="budget-alerts-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="budget-section-header">
                <h2><FaExclamationTriangle /> Alerts</h2>
                <span className="alerts-count">{visibleAlerts.length}</span>
              </div>
              <div className="alerts-list">
                {visibleAlerts.map((alert) => (
                  <motion.div
                    key={alert._id || alert.id}
                    className={`alert-card ${alert.type === "danger" ? "danger" : "warning"}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    layout
                  >
                    <div className="alert-icon">
                      {alert.type === "danger" ? (
                        <FaExclamationTriangle />
                      ) : (
                        <FaExclamationTriangle />
                      )}
                    </div>
                    <div className="alert-content">
                      <p className="alert-title">{alert.title || alert.message}</p>
                      {alert.message && alert.title && (
                        <p className="alert-message">{alert.message}</p>
                      )}
                      {alert.category && (
                        <span className="alert-category">{alert.category}</span>
                      )}
                    </div>
                    <button
                      className="alert-dismiss"
                      onClick={() => dismissAlert(alert._id || alert.id)}
                    >
                      <FaTimes />
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {overallFormOpen && (
            <motion.div
              className="budget-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="budget-modal"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <div className="budget-modal-header">
                  <h3><FaWallet /> {overallBudget > 0 ? "Update" : "Set"} Overall Budget</h3>
                  <button
                    className="budget-modal-close"
                    onClick={() => setOverallFormOpen(false)}
                  >
                    <FaTimes />
                  </button>
                </div>
                <div className="budget-modal-body">
                  <label>Monthly Budget Amount</label>
                  <div className="budget-input-wrap">
                    <span className="budget-input-currency">₹</span>
                    <input
                      type="number"
                      value={overallAmount}
                      onChange={(e) => setOverallAmount(e.target.value)}
                      placeholder="Enter amount"
                      min="0"
                    />
                  </div>
                </div>
                <div className="budget-modal-footer">
                  <button
                    className="budget-btn-cancel"
                    onClick={() => setOverallFormOpen(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    className="budget-btn-submit"
                    onClick={handleOverallSubmit}
                    disabled={submitting || !overallAmount || Number(overallAmount) <= 0}
                  >
                    {submitting ? "Saving..." : "Save"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {budgetFormOpen && (
            <motion.div
              className="budget-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="budget-modal"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <div className="budget-modal-header">
                  <h3><FaChartPie /> Add Category Budget</h3>
                  <button
                    className="budget-modal-close"
                    onClick={() => setBudgetFormOpen(false)}
                  >
                    <FaTimes />
                  </button>
                </div>
                <div className="budget-modal-body">
                  <label>Category</label>
                  <select
                    value={budgetForm.category}
                    onChange={(e) =>
                      setBudgetForm({ ...budgetForm, category: e.target.value })
                    }
                  >
                    <option value="">Select category</option>
                    {PREDEFINED_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>

                  <label style={{ marginTop: "1rem" }}>Budget Amount</label>
                  <div className="budget-input-wrap">
                    <span className="budget-input-currency">₹</span>
                    <input
                      type="number"
                      value={budgetForm.amount}
                      onChange={(e) =>
                        setBudgetForm({ ...budgetForm, amount: e.target.value })
                      }
                      placeholder="Enter amount"
                      min="0"
                    />
                  </div>
                </div>
                <div className="budget-modal-footer">
                  <button
                    className="budget-btn-cancel"
                    onClick={() => setBudgetFormOpen(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    className="budget-btn-submit"
                    onClick={handleCategoryBudgetSubmit}
                    disabled={
                      submitting ||
                      !budgetForm.category ||
                      !budgetForm.amount ||
                      Number(budgetForm.amount) <= 0
                    }
                  >
                    {submitting ? "Saving..." : "Save"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default BudgetManagement;
