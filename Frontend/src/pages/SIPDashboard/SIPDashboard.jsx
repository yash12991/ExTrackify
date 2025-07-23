import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash,
  FaRupeeSign,
  FaCalendarAlt,
  FaBullseye,
  FaBell,
  FaPlay,
  FaPause,
  FaPiggyBank,
  FaClock,
  FaArrowUp,
  FaArrowDown,
  FaCalculator,
  FaBackward,
} from "react-icons/fa";

import { Line } from "react-chartjs-2";
import toast from "react-hot-toast";
import {
  getAllSIPs,
  deleteSIP,
  createSIP,
  updateSIP,
  getSIPSummary,
  getSIPChartData,
  getUpcomingPayments,
} from "../../lib/api";
import "./SIPDashboard.css";
import Sipcalc from "../../components/calculator/Sipcalc";

const SIPDashboard = () => {
  const navigate = useNavigate();
  const [sips, setSips] = useState([]);
  const [summary, setSummary] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [upcomingPayments, setUpcomingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSIP, setEditingSIP] = useState(null);
  const [filter, setFilter] = useState("all"); // all, active, inactive
  const [displaycalc, setDisplayCalc] = useState("false");
  const [createFormData, setCreateFormData] = useState({
    sipName: "",
    amount: "",
    startDate: new Date().toISOString().split("T")[0],
    durationInMonths: 12,
    frequency: "monthly",
    goal: "",
    notes: "",
    expectedRate: 12,
  });

  const [editFormData, setEditFormData] = useState({
    sipName: "",
    amount: "",
    startDate: "",
    durationInMonths: 12,
    frequency: "monthly",
    goal: "",
    notes: "",
    expectedRate: 12,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sipsData, summaryData, chartDataResult, upcomingData] =
        await Promise.all([
          getAllSIPs(),
          getSIPSummary(),
          getSIPChartData(),
          getUpcomingPayments(30),
        ]);
      setSips(sipsData);
      setSummary(summaryData);
      setChartData(chartDataResult);
      setUpcomingPayments(upcomingData);
    } catch (error) {
      console.error("Error fetching SIP data:", error);
      toast.error("Failed to fetch SIP data");
    } finally {
      setLoading(false);
    }
  };

  const calculateExpectedMaturity = () => {
    const amount = parseFloat(createFormData.amount) || 0;
    const rate = parseFloat(createFormData.expectedRate) || 0;
    const duration = parseInt(createFormData.durationInMonths) || 0;
    const frequency = createFormData.frequency || "monthly";

    if (!amount || !rate || !duration) return 0;

    switch (frequency) {
      case "monthly": {
        const monthlyRate = rate / 12 / 100;
        return (
          amount *
          (((Math.pow(1 + monthlyRate, duration) - 1) / monthlyRate) *
            (1 + monthlyRate))
        );
      }
      case "quarterly": {
        const quarterlyRate = rate / 4 / 100;
        const quarterlyDuration = Math.ceil(duration / 3);
        return (
          amount *
          (((Math.pow(1 + quarterlyRate, quarterlyDuration) - 1) /
            quarterlyRate) *
            (1 + quarterlyRate))
        );
      }
      case "yearly": {
        const annualRate = rate / 100;
        const yearlyDuration = Math.ceil(duration / 12);
        return (
          amount *
          (((Math.pow(1 + annualRate, yearlyDuration) - 1) / annualRate) *
            (1 + annualRate))
        );
      }
      default: {
        const defaultMonthlyRate = rate / 12 / 100;
        return (
          amount *
          (((Math.pow(1 + defaultMonthlyRate, duration) - 1) /
            defaultMonthlyRate) *
            (1 + defaultMonthlyRate))
        );
      }
    }
  };

  const calculateEditExpectedMaturity = () => {
    const amount = parseFloat(editFormData.amount) || 0;
    const rate = parseFloat(editFormData.expectedRate) || 0;
    const duration = parseInt(editFormData.durationInMonths) || 0;
    const frequency = editFormData.frequency || "monthly";

    if (!amount || !rate || !duration) return 0;

    switch (frequency) {
      case "monthly": {
        const monthlyRate = rate / 12 / 100;
        return (
          amount *
          (((Math.pow(1 + monthlyRate, duration) - 1) / monthlyRate) *
            (1 + monthlyRate))
        );
      }
      case "quarterly": {
        const quarterlyRate = rate / 4 / 100;
        const quarterlyDuration = Math.ceil(duration / 3);
        return (
          amount *
          (((Math.pow(1 + quarterlyRate, quarterlyDuration) - 1) /
            quarterlyRate) *
            (1 + quarterlyRate))
        );
      }
      case "yearly": {
        const annualRate = rate / 100;
        const yearlyDuration = Math.ceil(duration / 12);
        return (
          amount *
          (((Math.pow(1 + annualRate, yearlyDuration) - 1) / annualRate) *
            (1 + annualRate))
        );
      }
      default: {
        const defaultMonthlyRate = rate / 12 / 100;
        return (
          amount *
          (((Math.pow(1 + defaultMonthlyRate, duration) - 1) /
            defaultMonthlyRate) *
            (1 + defaultMonthlyRate))
        );
      }
    }
  };

  const handleCreateSIP = async (e) => {
    e.preventDefault();
    try {
      await createSIP({
        ...createFormData,
        amount: Number(createFormData.amount),
        durationInMonths: Number(createFormData.durationInMonths),
      });
      toast.success("SIP created successfully!");
      setShowCreateModal(false);
      setCreateFormData({
        sipName: "",
        amount: "",
        startDate: new Date().toISOString().split("T")[0],
        durationInMonths: 12,
        frequency: "monthly",
        goal: "",
        notes: "",
        expectedRate: 12,
      });
      fetchData();
    } catch (error) {
      toast.error("Failed to create SIP");
    }
  };

  const handleEditSIP = (sip) => {
    setEditingSIP(sip);
    setEditFormData({
      sipName: sip.sipName,
      amount: sip.amount.toString(),
      startDate: new Date(sip.startDate).toISOString().split("T")[0],
      durationInMonths: sip.durationInMonths,
      frequency: sip.frequency,
      goal: sip.goal || "",
      notes: sip.notes || "",
      expectedRate: sip.expectedRate || 12,
    });
    setShowEditModal(true);
  };

  const handleUpdateSIP = async (e) => {
    e.preventDefault();
    try {
      await updateSIP(editingSIP._id, {
        ...editFormData,
        amount: Number(editFormData.amount),
        durationInMonths: Number(editFormData.durationInMonths),
        expectedRate: Number(editFormData.expectedRate),
      });
      toast.success("SIP updated successfully!");
      setShowEditModal(false);
      setEditingSIP(null);
      fetchData();
    } catch (error) {
      toast.error("Failed to update SIP");
    }
  };

  const handleDeleteSIP = async (sipId, sipName) => {
    if (window.confirm(`Are you sure you want to delete "${sipName}"?`)) {
      try {
        await deleteSIP(sipId);
        toast.success("SIP deleted successfully!");
        fetchData();
      } catch (error) {
        toast.error("Failed to delete SIP");
      }
    }
  };

  const filteredSIPs = sips.filter((sip) => {
    if (filter === "active") return sip.isActive;
    if (filter === "inactive") return !sip.isActive;
    return true;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading SIP Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="sip-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <img src="./image.png" alt="logo" style={{ width: "60px" }} />
          <h1>SIP Dashboard</h1>
          <p>Manage your Systematic Investment Plans</p>
        </div>

        <div className="Nav-btn">
          <button className="back-bt " onClick={() => navigate("/dashboard")}>
            <FaBackward />
          </button>
          <button
            className="calc-btn"
            onClick={() => setDisplayCalc(displaycalc === true ? false : true)}
          >
            <FaCalculator />
            Calculator
          </button>
          <button
            className="create-btn"
            onClick={() => setShowCreateModal(true)}
          >
            <FaPlus /> Create New
          </button>
        </div>
      </div>

      {displaycalc === true ? (
        <Sipcalc onClose={() => setDisplayCalc(false)} />
      ) : (
        " "
      )}
      {/* Summary Cards */}
      {summary && (
        <div className="summary-grid" style={{ marginTop: "45px" }}>
          <div className="summary-card">
            <div className="card-icon">
              <FaPiggyBank />
            </div>
            <div className="card-content">
              <h3>Total SIPs</h3>
              <div className="card-value">{summary.totalSIPs}</div>
              <div className="card-subtitle">{summary.activeSIPs} active</div>
            </div>
          </div>

          <div className="summary-card">
            <div className="card-icon">
              <FaRupeeSign />
            </div>
            <div className="card-content">
              <h3>Total Investment</h3>
              <div className="card-value">
                ₹{summary.totalInvestment.toLocaleString()}
              </div>
              <div className="card-subtitle">
                ₹{summary.totalPaid.toLocaleString()} paid
              </div>
            </div>
          </div>

          <div className="summary-card">
            <div className="card-icon">
              <FaCalendarAlt />
            </div>
            <div className="card-content">
              <h3>Monthly Commitment</h3>
              <div className="card-value">
                ₹{summary.monthlyCommitment.toLocaleString()}
              </div>
              <div className="card-subtitle">per month</div>
            </div>
          </div>

          <div className="summary-card">
            <div className="card-icon">
              <FaBell />
            </div>
            <div className="card-content">
              <h3>Upcoming Payments</h3>
              <div className="card-value">
                {summary.upcomingPayments?.length || 0}
              </div>
              <div className="card-subtitle">in next 30 days</div>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Payments */}
      {upcomingPayments && upcomingPayments.length > 0 && (
        <div className="upcoming-payments">
          <h3>
            <FaBell /> Upcoming Payments ({upcomingPayments.length})
          </h3>
          <div className="payments-list">
            {upcomingPayments.slice(0, 3).map((payment) => (
              <div key={payment.sipId} className="payment-item">
                <div className="payment-info">
                  <h4>{payment.sipName}</h4>
                  <p>₹{payment.amount.toLocaleString()}</p>
                </div>
                <div className="payment-due">
                  <span
                    className={`due-days ${
                      payment.daysUntil <= 3 ? "urgent" : ""
                    }`}
                  >
                    {payment.daysUntil === 0
                      ? "Due Today"
                      : `${payment.daysUntil} days`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="filter-section">
        <h2>Your SIPs</h2>
        <div className="filter-tabs">
          <button
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            All ({sips.length})
          </button>
          <button
            className={filter === "active" ? "active" : ""}
            onClick={() => setFilter("active")}
          >
            Active ({sips.filter((s) => s.isActive).length})
          </button>
          <button
            className={filter === "inactive" ? "active" : ""}
            onClick={() => setFilter("inactive")}
          >
            Inactive ({sips.filter((s) => !s.isActive).length})
          </button>
        </div>
      </div>

      {/* SIP Cards */}
      {filteredSIPs.length === 0 ? (
        <div className="no-sips">
          <FaPiggyBank />
          <h3>No SIPs found</h3>
          <p>Start your investment journey by creating your first SIP</p>
          <button
            className="create-btn"
            onClick={() => setShowCreateModal(true)}
          >
            <FaPlus /> Create Your First SIP
          </button>
        </div>
      ) : (
        <div className="sips-grid">
          {filteredSIPs.map((sip) => (
            <div key={sip._id} className="sip-card">
              <div className="sip-header">
                <div className="sip-info">
                  <h3>{sip.sipName}</h3>
                  <p>{sip.goal}</p>
                </div>
                <span
                  className={`status ${sip.isActive ? "active" : "inactive"}`}
                >
                  {sip.isActive ? <FaPlay /> : <FaPause />}
                  {sip.isActive ? "Active" : "Paused"}
                </span>
              </div>

              <div className="sip-details">
                <div className="detail-row">
                  <span className="label">Amount:</span>
                  <span className="value">₹{sip.amount.toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Duration:</span>
                  <span className="value">{sip.durationInMonths} months</span>
                </div>
                <div className="detail-row">
                  <span className="label">Next Payment:</span>
                  <span className="value">
                    {new Date(sip.nextPaymentDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Expected Return:</span>
                  <span className="value">
                    ₹{sip.expectedMaturityValue?.toLocaleString() || "N/A"}
                  </span>
                </div>
              </div>

              <div className="sip-progress">
                <div className="progress-info">
                  <span>Progress: ₹{sip.totalInvested.toLocaleString()}</span>
                  <span>
                    {Math.round(
                      (sip.totalInvested /
                        (sip.amount * sip.durationInMonths)) *
                        100
                    )}
                    %
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min(
                        (sip.totalInvested /
                          (sip.amount * sip.durationInMonths)) *
                          100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="sip-actions">
                <button
                  className="action-btn view"
                  onClick={() => navigate(`/sip/${sip._id}`)}
                >
                  <FaEye /> View
                </button>
                <button
                  className="action-btn edit"
                  onClick={() => handleEditSIP(sip)}
                >
                  <FaEdit /> Edit
                </button>
                <button
                  className="action-btn delete"
                  onClick={() => handleDeleteSIP(sip._id, sip.sipName)}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create SIP Modal */}
      {showCreateModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowCreateModal(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New SIP</h3>
              <button onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateSIP}>
              <div className="form-group">
                <label>SIP Name *</label>
                <input
                  type="text"
                  value={createFormData.sipName}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      sipName: e.target.value,
                    })
                  }
                  placeholder="e.g., Retirement Fund"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Amount *</label>
                  <input
                    type="number"
                    value={createFormData.amount}
                    onChange={(e) =>
                      setCreateFormData({
                        ...createFormData,
                        amount: e.target.value,
                      })
                    }
                    placeholder="5000"
                    min="1000"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Expected Rate (%) *</label>
                  <input
                    type="number"
                    value={createFormData.expectedRate}
                    onChange={(e) =>
                      setCreateFormData({
                        ...createFormData,
                        expectedRate: e.target.value,
                      })
                    }
                    placeholder="12"
                    min="0"
                    max="50"
                    step="0.1"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    value={createFormData.startDate}
                    onChange={(e) =>
                      setCreateFormData({
                        ...createFormData,
                        startDate: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Duration</label>
                  <select
                    value={createFormData.durationInMonths}
                    onChange={(e) =>
                      setCreateFormData({
                        ...createFormData,
                        durationInMonths: e.target.value,
                      })
                    }
                  >
                    <option value={6}>6 Months</option>
                    <option value={12}>1 Year</option>
                    <option value={24}>2 Years</option>
                    <option value={36}>3 Years</option>
                    <option value={60}>5 Years</option>
                    <option value={120}>20 Years</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Frequency</label>
                  <select
                    value={createFormData.frequency}
                    onChange={(e) =>
                      setCreateFormData({
                        ...createFormData,
                        frequency: e.target.value,
                      })
                    }
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Investment Goal</label>
                  <input
                    type="text"
                    value={createFormData.goal}
                    onChange={(e) =>
                      setCreateFormData({
                        ...createFormData,
                        goal: e.target.value,
                      })
                    }
                    placeholder="e.g., Retirement"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Notes (Optional)</label>
                <textarea
                  value={createFormData.notes}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      notes: e.target.value,
                    })
                  }
                  rows="3"
                  placeholder="Add any additional notes..."
                />
              </div>

              <div className="expected-return">
                <h4>Expected Maturity Value</h4>
                <div className="return-amount">
                  ₹
                  {createFormData.amount &&
                  createFormData.expectedRate &&
                  createFormData.durationInMonths
                    ? Math.round(calculateExpectedMaturity()).toLocaleString()
                    : "0"}
                </div>
                <small>
                  Based on {createFormData.expectedRate}% annual return
                </small>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit">Create SIP</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit SIP Modal */}
      {showEditModal && editingSIP && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit SIP</h3>
              <button onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleUpdateSIP}>
              <div className="form-group">
                <label>SIP Name *</label>
                <input
                  type="text"
                  value={editFormData.sipName}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      sipName: e.target.value,
                    })
                  }
                  placeholder="e.g., Retirement Fund"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Amount *</label>
                  <input
                    type="number"
                    value={editFormData.amount}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        amount: e.target.value,
                      })
                    }
                    placeholder="5000"
                    min="1000"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Expected Rate (%) *</label>
                  <input
                    type="number"
                    value={editFormData.expectedRate}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        expectedRate: e.target.value,
                      })
                    }
                    placeholder="12"
                    min="0"
                    max="50"
                    step="0.1"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    value={editFormData.startDate}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        startDate: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Duration</label>
                  <select
                    value={editFormData.durationInMonths}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        durationInMonths: e.target.value,
                      })
                    }
                  >
                    <option value={6}>6 Months</option>
                    <option value={12}>1 Year</option>
                    <option value={24}>2 Years</option>
                    <option value={36}>3 Years</option>
                    <option value={60}>5 Years</option>
                    <option value={120}>10 Years</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Frequency</label>
                  <select
                    value={editFormData.frequency}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        frequency: e.target.value,
                      })
                    }
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Investment Goal</label>
                  <input
                    type="text"
                    value={editFormData.goal}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        goal: e.target.value,
                      })
                    }
                    placeholder="e.g., Retirement"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Notes (Optional)</label>
                <textarea
                  value={editFormData.notes}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      notes: e.target.value,
                    })
                  }
                  rows="3"
                  placeholder="Add any additional notes..."
                />
              </div>

              <div className="expected-return">
                <h4>Expected Maturity Value</h4>
                <div className="return-amount">
                  ₹
                  {editFormData.amount &&
                  editFormData.expectedRate &&
                  editFormData.durationInMonths
                    ? Math.round(
                        calculateEditExpectedMaturity()
                      ).toLocaleString()
                    : "0"}
                </div>
                <small>
                  Based on {editFormData.expectedRate}% annual return
                </small>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit">Update SIP</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SIPDashboard;
