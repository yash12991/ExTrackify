import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  FaBriefcase,
  FaPlus,
  FaTrash,
  FaRupeeSign,
  FaChartPie,
  FaSync,
  FaArrowUp,
  FaArrowDown,
  FaTimes,
} from "react-icons/fa";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  getPortfolio,
  addHolding,
  removeHolding,
  refreshPortfolio,
  getPortfolioAnalytics,
} from "../../lib/api";
import toast from "react-hot-toast";
import "./Portfolio.css";

const defaultForm = {
  type: "stock",
  symbol: "",
  name: "",
  quantity: "",
  totalInvested: "",
  buyPrice: "",
  buyNav: "",
};

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [portfolioRes, analyticsRes] = await Promise.all([
        getPortfolio(),
        getPortfolioAnalytics(),
      ]);
      const pData = portfolioRes?.data || portfolioRes;
      const aData = analyticsRes?.data || analyticsRes;
      setPortfolio(pData);
      setAnalytics(aData);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      toast.error("Failed to fetch portfolio data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await refreshPortfolio();
      toast.success("Prices refreshed!");
      await fetchData();
    } catch (error) {
      toast.error("Failed to refresh prices");
    } finally {
      setRefreshing(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddHolding = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        type: formData.type,
        symbol: formData.symbol,
        name: formData.name,
        quantity: Number(formData.quantity),
        totalInvested: Number(formData.totalInvested),
      };
      if (formData.type === "stock") {
        payload.buyPrice = Number(formData.buyPrice);
      } else {
        payload.buyNav = Number(formData.buyNav);
      }
      await addHolding(payload);
      toast.success("Holding added!");
      setShowAddModal(false);
      setFormData(defaultForm);
      await fetchData();
    } catch (error) {
      toast.error("Failed to add holding");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveHolding = async (id, name) => {
    if (!window.confirm(`Remove "${name}" from your portfolio?`)) return;
    try {
      await removeHolding(id);
      toast.success("Holding removed");
      await fetchData();
    } catch (error) {
      toast.error("Failed to remove holding");
    }
  };

  const holdings = portfolio?.holdings || [];
  const totalInvested = portfolio?.totalInvested || 0;
  const currentValue = portfolio?.currentValue || 0;
  const totalReturn = portfolio?.totalReturn || 0;
  const returnPercent = portfolio?.returnPercent || 0;
  const stockCount = portfolio?.stockCount || 0;
  const fundCount = portfolio?.fundCount || 0;
  const topHoldings = analytics?.topHoldings || portfolio?.topHoldings || [];

  const isPositive = totalReturn >= 0;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="portfolio-loading">
          <div className="portfolio-spinner" />
          <p>Loading portfolio...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="portfolio-dashboard">
        <div className="portfolio-header">
          <div className="header-content">
            <p className="eyebrow">Investment Portfolio</p>
            <h1>
              <FaBriefcase /> My Portfolio
            </h1>
            <p>Track and manage your stocks & mutual funds</p>
          </div>
          <div className="header-actions">
            <button
              className="refresh-btn"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <FaSync className={refreshing ? "spin" : ""} />
              {refreshing ? "Refreshing..." : "Refresh Prices"}
            </button>
            <button
              className="add-btn"
              onClick={() => setShowAddModal(true)}
            >
              <FaPlus /> Add Holding
            </button>
          </div>
        </div>

        <div className="summary-grid">
          <motion.div
            className="summary-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
          >
            <div className="card-icon">
              <FaRupeeSign />
            </div>
            <div className="card-content">
              <h3>Total Invested</h3>
              <div className="card-value">
                ₹{totalInvested.toLocaleString()}
              </div>
            </div>
          </motion.div>

          <motion.div
            className="summary-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <div className="card-icon">
              <FaChartPie />
            </div>
            <div className="card-content">
              <h3>Current Value</h3>
              <div className="card-value">
                ₹{currentValue.toLocaleString()}
              </div>
            </div>
          </motion.div>

          <motion.div
            className={`summary-card ${isPositive ? "positive" : "negative"}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="card-icon">
              {isPositive ? <FaArrowUp /> : <FaArrowDown />}
            </div>
            <div className="card-content">
              <h3>Total Return</h3>
              <div className="card-value">
                {isPositive ? "+" : ""}₹{Math.abs(totalReturn).toLocaleString()}
              </div>
            </div>
          </motion.div>

          <motion.div
            className={`summary-card ${isPositive ? "positive" : "negative"}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="card-icon">
              <FaChartPie />
            </div>
            <div className="card-content">
              <h3>Return %</h3>
              <div className="card-value">
                {isPositive ? "+" : ""}
                {returnPercent.toFixed(2)}%
              </div>
            </div>
          </motion.div>
        </div>

        <div className="count-row">
          <div className="count-chip">
            <FaBriefcase /> {stockCount} Stocks
          </div>
          <div className="count-chip">
            <FaChartPie /> {fundCount} Mutual Funds
          </div>
        </div>

        {topHoldings.length > 0 && (
          <div className="section">
            <h2 className="section-title">Top Holdings</h2>
            <div className="top-holdings-grid">
              {topHoldings.slice(0, 5).map((h, i) => (
                <motion.div
                  key={h.symbol || h.name || i}
                  className="top-holding-card"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="top-holding-name">{h.name}</div>
                  <div className="top-holding-value">
                    ₹{(h.value || h.currentValue || 0).toLocaleString()}
                  </div>
                  <div className="top-holding-percent">{h.allocationPercent?.toFixed(1)}%</div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <div className="section">
          <h2 className="section-title">All Holdings ({holdings.length})</h2>
          {holdings.length === 0 ? (
            <div className="empty-state">
              <FaBriefcase />
              <h3>No holdings yet</h3>
              <p>Start building your portfolio by adding your first holding</p>
              <button className="add-btn" onClick={() => setShowAddModal(true)}>
                <FaPlus /> Add Your First Holding
              </button>
            </div>
          ) : (
            <div className="holdings-table-wrap">
              <table className="holdings-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Qty</th>
                    <th>Invested</th>
                    <th>Current Value</th>
                    <th>Return</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((h) => {
                    const hReturn = h.returnPercent ?? (
                      h.currentValue && h.totalInvested
                        ? ((h.currentValue - h.totalInvested) / h.totalInvested) * 100
                        : 0
                    );
                    const hPositive = hReturn >= 0;
                    return (
                      <tr key={h._id}>
                        <td className="holding-name">{h.name}</td>
                        <td>
                          <span className={`type-badge ${h.type}`}>
                            {h.type === "stock" ? "Stock" : "MF"}
                          </span>
                        </td>
                        <td>{h.quantity}</td>
                        <td>₹{(h.totalInvested || 0).toLocaleString()}</td>
                        <td>₹{(h.currentValue || 0).toLocaleString()}</td>
                        <td>
                          <span className={`return-badge ${hPositive ? "up" : "down"}`}>
                            {hPositive ? <FaArrowUp /> : <FaArrowDown />}
                            {hPositive ? "+" : ""}{hReturn.toFixed(2)}%
                          </span>
                        </td>
                        <td>
                          <button
                            className="remove-btn"
                            onClick={() => handleRemoveHolding(h._id, h.name)}
                            title="Remove holding"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowAddModal(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Holding</h3>
              <button onClick={() => setShowAddModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleAddHolding}>
              <div className="form-group">
                <label>Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                >
                  <option value="stock">Stock</option>
                  <option value="mutual_fund">Mutual Fund</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Symbol *</label>
                  <input
                    type="text"
                    name="symbol"
                    value={formData.symbol}
                    onChange={handleInputChange}
                    placeholder={formData.type === "stock" ? "e.g. RELIANCE" : "e.g. 119551"}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Reliance Industries"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    placeholder="10"
                    min="0"
                    step="any"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Total Invested (₹) *</label>
                  <input
                    type="number"
                    name="totalInvested"
                    value={formData.totalInvested}
                    onChange={handleInputChange}
                    placeholder="50000"
                    min="0"
                    step="any"
                    required
                  />
                </div>
              </div>

              {formData.type === "stock" ? (
                <div className="form-group">
                  <label>Buy Price (per share) *</label>
                  <input
                    type="number"
                    name="buyPrice"
                    value={formData.buyPrice}
                    onChange={handleInputChange}
                    placeholder="2500.00"
                    min="0"
                    step="any"
                    required
                  />
                </div>
              ) : (
                <div className="form-group">
                  <label>Buy NAV *</label>
                  <input
                    type="number"
                    name="buyNav"
                    value={formData.buyNav}
                    onChange={handleInputChange}
                    placeholder="150.00"
                    min="0"
                    step="any"
                    required
                  />
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" disabled={submitting}>
                  {submitting ? "Adding..." : "Add Holding"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Portfolio;
