import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaBell, FaPlus, FaTrash, FaEye, FaEyeSlash, FaCheck, FaSearch } from "react-icons/fa";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getAlerts, createAlert, updateAlert, deleteAlert, checkAlerts } from "../../lib/api";
import "./Alerts.css";

const initialForm = {
  type: "stock",
  symbol: "",
  schemeCode: "",
  schemeName: "",
  targetPrice: "",
  targetNav: "",
  condition: "above",
  name: "",
};

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(false);
  const [triggeredResults, setTriggeredResults] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await getAlerts();
      setAlerts(res.data || []);
    } catch {
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (alertItem) => {
    try {
      await updateAlert(alertItem._id, { active: !alertItem.active });
      setAlerts((prev) =>
        prev.map((a) =>
          a._id === alertItem._id ? { ...a, active: !a.active } : a
        )
      );
    } catch {}
  };

  const handleDelete = async (id) => {
    try {
      await deleteAlert(id);
      setAlerts((prev) => prev.filter((a) => a._id !== id));
    } catch {}
    setDeleteId(null);
  };

  const handleCheckNow = async () => {
    setChecking(true);
    setTriggeredResults(null);
    try {
      const res = await checkAlerts();
      setTriggeredResults(res.data || res);
      fetchAlerts();
    } catch {}
    setChecking(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        type: form.type,
        condition: form.condition,
        name: form.name || undefined,
      };
      if (form.type === "stock") {
        payload.symbol = form.symbol;
        payload.targetPrice = parseFloat(form.targetPrice);
      } else {
        payload.schemeCode = form.schemeCode;
        payload.schemeName = form.schemeName;
        payload.targetNav = parseFloat(form.targetNav);
      }
      await createAlert(payload);
      setForm(initialForm);
      setShowModal(false);
      fetchAlerts();
    } catch {}
    setSubmitting(false);
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleString([], { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const getStatusLabel = (alertItem) => {
    if (alertItem.triggered) return "Triggered";
    if (alertItem.active) return "Active";
    return "Inactive";
  };

  const getStatusClass = (alertItem) => {
    if (alertItem.triggered) return "alert-status-triggered";
    if (alertItem.active) return "alert-status-active";
    return "alert-status-inactive";
  };

  return (
    <DashboardLayout>
      <div className="alerts-page">
        <motion.div className="alerts-header" initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }}>
          <div className="alerts-header-text">
            <h1><FaBell className="alerts-header-icon" /> Price / NAV Alerts</h1>
            <p>Get notified when stocks hit your target price or mutual funds reach your target NAV</p>
          </div>
          <div className="alerts-header-actions">
            <motion.button
              className="alerts-check-btn"
              onClick={handleCheckNow}
              disabled={checking}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaSearch /> {checking ? "Checking..." : "Check Now"}
            </motion.button>
            <motion.button
              className="alerts-add-btn"
              onClick={() => setShowModal(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaPlus /> Create Alert
            </motion.button>
          </div>
        </motion.div>

        {triggeredResults && (
          <motion.div
            className="alerts-triggered-banner"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
          >
            <FaCheck />
            <span>Check complete! {triggeredResults.triggered?.length || 0} alert(s) triggered.</span>
            <button className="alerts-banner-close" onClick={() => setTriggeredResults(null)}>&times;</button>
          </motion.div>
        )}

        {loading ? (
          <div className="alerts-loading">
            <div className="alerts-spinner" />
            <p>Loading alerts...</p>
          </div>
        ) : alerts.length === 0 ? (
          <motion.div className="alerts-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <FaBell className="alerts-empty-icon" />
            <h3>No alerts yet</h3>
            <p>Create a price or NAV alert to get notified when your targets are met.</p>
            <button className="alerts-add-btn" onClick={() => setShowModal(true)}>
              <FaPlus /> Create Your First Alert
            </button>
          </motion.div>
        ) : (
          <div className="alerts-list">
            <AnimatePresence>
              {alerts.map((alertItem, i) => (
                <motion.div
                  key={alertItem._id}
                  className={`alerts-card ${getStatusClass(alertItem)}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ delay: i * 0.03 }}
                  layout
                >
                  <div className="alerts-card-left">
                    <div className="alerts-card-top-row">
                      <span className={`alerts-type-badge ${alertItem.type === "stock" ? "alerts-type-stock" : "alerts-type-mf"}`}>
                        {alertItem.type === "stock" ? "Stock" : "MF"}
                      </span>
                      <span className="alerts-card-name">{alertItem.name || alertItem.symbol || alertItem.schemeName || alertItem.schemeCode}</span>
                    </div>
                    <div className="alerts-card-details">
                      {alertItem.type === "stock" ? (
                        <span className="alerts-detail-item"><strong>Symbol:</strong> {alertItem.symbol}</span>
                      ) : (
                        <>
                          <span className="alerts-detail-item"><strong>Scheme:</strong> {alertItem.schemeName || alertItem.schemeCode}</span>
                        </>
                      )}
                      <span className="alerts-detail-item">
                        <strong>Target {alertItem.type === "stock" ? "Price" : "NAV"}:</strong> ₹
                        {alertItem.type === "stock" ? alertItem.targetPrice : alertItem.targetNav}
                      </span>
                      <span className="alerts-detail-item">
                        <strong>Condition:</strong>
                        <span className={`alerts-condition ${alertItem.condition === "above" ? "condition-above" : "condition-below"}`}>
                          {alertItem.condition === "above" ? "Above" : "Below"}
                        </span>
                      </span>
                      {alertItem.currentValue != null && (
                        <span className="alerts-detail-item"><strong>Current:</strong> ₹{alertItem.currentValue}</span>
                      )}
                    </div>
                    <div className="alerts-card-footer">
                      <span className={`alerts-status-badge ${getStatusClass(alertItem)}`}>
                        {getStatusLabel(alertItem)}
                      </span>
                      {alertItem.lastChecked && (
                        <span className="alerts-last-checked">Checked: {formatTime(alertItem.lastChecked)}</span>
                      )}
                    </div>
                  </div>
                  <div className="alerts-card-actions">
                    <motion.button
                      className="alerts-action-btn"
                      title={alertItem.active ? "Deactivate" : "Activate"}
                      onClick={() => handleToggle(alertItem)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {alertItem.active ? <FaEye /> : <FaEyeSlash />}
                    </motion.button>
                    <motion.button
                      className="alerts-action-btn alerts-action-delete"
                      title="Delete"
                      onClick={() => setDeleteId(alertItem._id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FaTrash />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <AnimatePresence>
          {deleteId && (
            <motion.div className="alerts-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteId(null)}>
              <motion.div
                className="alerts-confirm-modal"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3>Delete Alert</h3>
                <p>Are you sure you want to delete this alert?</p>
                <div className="alerts-confirm-actions">
                  <button className="alerts-btn-cancel" onClick={() => setDeleteId(null)}>Cancel</button>
                  <button className="alerts-btn-confirm" onClick={() => handleDelete(deleteId)}>Delete</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showModal && (
            <motion.div className="alerts-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)}>
              <motion.div
                className="alerts-modal"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="alerts-modal-header">
                  <h2><FaPlus /> Create Alert</h2>
                  <button className="alerts-modal-close" onClick={() => setShowModal(false)}>&times;</button>
                </div>
                <form className="alerts-modal-form" onSubmit={handleCreate}>
                  <div className="alerts-form-group">
                    <label>Type</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                    >
                      <option value="stock">Stock</option>
                      <option value="mutual_fund">Mutual Fund</option>
                    </select>
                  </div>

                  {form.type === "stock" ? (
                    <div className="alerts-form-group">
                      <label>Symbol</label>
                      <input
                        type="text"
                        placeholder="e.g. TCS, RELIANCE"
                        value={form.symbol}
                        onChange={(e) => setForm({ ...form, symbol: e.target.value.toUpperCase() })}
                        required
                      />
                    </div>
                  ) : (
                    <>
                      <div className="alerts-form-group">
                        <label>Scheme Code</label>
                        <input
                          type="text"
                          placeholder="e.g. 119551"
                          value={form.schemeCode}
                          onChange={(e) => setForm({ ...form, schemeCode: e.target.value })}
                          required
                        />
                      </div>
                      <div className="alerts-form-group">
                        <label>Scheme Name</label>
                        <input
                          type="text"
                          placeholder="Optional scheme name"
                          value={form.schemeName}
                          onChange={(e) => setForm({ ...form, schemeName: e.target.value })}
                        />
                      </div>
                    </>
                  )}

                  <div className="alerts-form-group">
                    <label>Condition</label>
                    <select
                      value={form.condition}
                      onChange={(e) => setForm({ ...form, condition: e.target.value })}
                    >
                      <option value="above">Above</option>
                      <option value="below">Below</option>
                    </select>
                  </div>

                  <div className="alerts-form-group">
                    <label>Target {form.type === "stock" ? "Price" : "NAV"} (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Enter target value"
                      value={form.type === "stock" ? form.targetPrice : form.targetNav}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          [form.type === "stock" ? "targetPrice" : "targetNav"]: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="alerts-form-group">
                    <label>Name (optional)</label>
                    <input
                      type="text"
                      placeholder="Friendly name for this alert"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="alerts-submit-btn" disabled={submitting}>
                    {submitting ? "Creating..." : "Create Alert"}
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default Alerts;
