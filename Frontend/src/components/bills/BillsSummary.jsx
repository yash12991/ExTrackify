import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaMoneyBillWave,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaArrowRight,
  FaCalendarAlt,
  FaRupeeSign,
} from "react-icons/fa";
import { getBillsSummary } from "../../lib/api";
import "./BillsSummary.css";

const BillsSummary = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const data = await getBillsSummary();
      setSummary(data);
    } catch (error) {
      console.error("Error fetching bills summary:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="bills-summary-card">
        <div className="summary-header">
          <h3>Bills & Subscriptions</h3>
        </div>
        <div className="loading-placeholder">
          <div className="skeleton-line"></div>
          <div className="skeleton-line"></div>
          <div className="skeleton-line"></div>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="bills-summary-card">
        <div className="summary-header">
          <h3>Bills & Subscriptions</h3>
        </div>
        <div className="no-bills">
          <FaMoneyBillWave className="no-bills-icon" />
          <p>No bills found</p>
          <button 
            className="add-first-bill-btn"
            onClick={() => navigate("/bills")}
          >
            Add Your First Bill
          </button>
        </div>
      </div>
    );
  }

  const totalPending = summary.summary.pending.totalAmount;
  const totalOverdue = summary.summary.overdue.totalAmount;
  const upcomingBills = summary.upcomingBills;

  return (
    <motion.div
      className="bills-summary-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="summary-header">
        <h3>
          <FaMoneyBillWave className="header-icon" />
          Bills & Subscriptions
        </h3>
        <button 
          className="view-all-btn"
          onClick={() => navigate("/bills")}
        >
          View All
          <FaArrowRight />
        </button>
      </div>

      <div className="bills-overview">
        <div className="overview-stats">
          <div className="stat-item pending">
            <FaClock className="stat-icon" />
            <div className="stat-content">
              <span className="stat-label">Pending</span>
              <span className="stat-amount">{formatCurrency(totalPending)}</span>
            </div>
          </div>

          {totalOverdue > 0 && (
            <div className="stat-item overdue">
              <FaExclamationTriangle className="stat-icon" />
              <div className="stat-content">
                <span className="stat-label">Overdue</span>
                <span className="stat-amount">{formatCurrency(totalOverdue)}</span>
              </div>
            </div>
          )}
        </div>

        {upcomingBills.length > 0 && (
          <div className="upcoming-bills">
            <h4>
              <FaCalendarAlt className="upcoming-icon" />
              Upcoming Bills
            </h4>
            <div className="upcoming-list">
              {upcomingBills.slice(0, 3).map((bill) => (
                <div key={bill._id} className="upcoming-bill-item">
                  <div className="bill-info">
                    <span className="bill-name">{bill.billName}</span>
                    <span className="bill-category">{bill.category}</span>
                  </div>
                  <div className="bill-details">
                    <span className="bill-amount">
                      <FaRupeeSign className="rupee-icon" />
                      {formatCurrency(bill.amount)}
                    </span>
                    <span className="bill-due">
                      Due: {formatDate(bill.dueDate)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            {upcomingBills.length > 3 && (
              <div className="more-bills">
                <button 
                  className="view-more-btn"
                  onClick={() => navigate("/bills")}
                >
                  +{upcomingBills.length - 3} more bills
                </button>
              </div>
            )}
          </div>
        )}

        {summary.overdueCount > 0 && (
          <div className="overdue-alert">
            <FaExclamationTriangle className="alert-icon" />
            <div className="alert-content">
              <strong>Attention Required!</strong>
              <p>You have {summary.overdueCount} overdue bill{summary.overdueCount > 1 ? 's' : ''}.</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default BillsSummary;
