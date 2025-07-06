import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  FaTimes,
  FaRupeeSign,
  FaCalendarAlt,
  FaCreditCard,
  FaStickyNote,
  FaExclamationTriangle,
} from "react-icons/fa";
import "./ExpenseForm.css";
import { addExpense } from "../../lib/api";

const AddExpense = ({ onSubmit, onClose, expense = null }) => {
  const [formData, setFormData] = useState(
    expense || {
      amount: "",
      category: "",
      notes: "",
      date: new Date().toISOString().split("T")[0],
      modeofpayment: "",
      tags: [],
      recurring: false,
    }
  );

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const categories = [
    "food",
    "transport",
    "housing",
    "utilities",
    "healthcare",
    "entertainment",
    "shopping",
    "other",
  ];

  const paymentModes = [
    { value: "card", label: "Card" },
    { value: "upi", label: "UPI" },
    { value: "cash", label: "Cash" },
    { value: "netbanking", label: "Net Banking" },
    { value: "cheque", label: "Cheque" },
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.amount || Number(formData.amount) <= 0) {
      newErrors.amount = "Please enter a valid amount";
    }

    if (!formData.category) {
      newErrors.category = "Please select a category";
    }

    if (!formData.modeofpayment) {
      newErrors.modeofpayment = "Please select a payment mode";
    }

    if (!formData.date) {
      newErrors.date = "Please select a date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setLoading(true);
    try {
      const expenseData = {
        category: formData.category,
        amount: Number(formData.amount),
        date: new Date(formData.date).toISOString(),
        notes: formData.notes,
        modeofpayment: formData.modeofpayment,
        tags: formData.tags,
        recurring: formData.recurring,
      };

      const res = await addExpense(expenseData);
      toast.success("Expense added successfully!");
      onSubmit(expenseData);
      onClose();
    } catch (error) {
      console.error("Error adding expense:", error);
      toast.error("Failed to add expense. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const handleTagsChange = (e) => {
    const value = e.target.value;
    const tags = value
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);
    handleInputChange("tags", tags);
  };

  return (
    <motion.div
      className="expense-form-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.form
        onSubmit={handleSubmit}
        className="expense-form"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="form-header">
          <h2>{expense ? "Edit Expense" : "Add New Expense"}</h2>
          <button type="button" className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <p className="subtitle">
          {expense
            ? "Update your expense details"
            : "Track your spending easily"}
        </p>

        <div className="form-content">
          <div className="form-row">
            <div
              className={`form-group has-icon ${errors.amount ? "error" : ""}`}
            >
              <label>
                Amount <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <FaRupeeSign className="input-icon" />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => handleInputChange("amount", e.target.value)}
                  placeholder="0.00"
                />
              </div>
              {errors.amount && (
                <div className="validation-error">
                  <FaExclamationTriangle />
                  {errors.amount}
                </div>
              )}
            </div>

            <div className={`form-group ${errors.category ? "error" : ""}`}>
              <label>
                Category <span className="required">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                className="form-select"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
              {errors.category && (
                <div className="validation-error">
                  <FaExclamationTriangle />
                  {errors.category}
                </div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div
              className={`form-group ${errors.modeofpayment ? "error" : ""}`}
            >
              <label>
                Payment Mode <span className="required">*</span>
              </label>
              <select
                value={formData.modeofpayment}
                onChange={(e) =>
                  handleInputChange("modeofpayment", e.target.value)
                }
                className="form-select"
              >
                <option value="">Select Payment Mode</option>
                {paymentModes.map((mode) => (
                  <option key={mode.value} value={mode.value}>
                    {mode.label}
                  </option>
                ))}
              </select>
              {errors.modeofpayment && (
                <div className="validation-error">
                  <FaExclamationTriangle />
                  {errors.modeofpayment}
                </div>
              )}
            </div>

            <div
              className={`form-group has-icon ${errors.date ? "error" : ""}`}
            >
              <label>
                Date <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <FaCalendarAlt className="input-icon" />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
              {errors.date && (
                <div className="validation-error">
                  <FaExclamationTriangle />
                  {errors.date}
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Tags</label>
            <div className="input-wrapper">
              <input
                type="text"
                value={formData.tags.join(", ")}
                onChange={handleTagsChange}
                placeholder="lunch, friends, work (comma separated)"
                className="tags-input"
              />
            </div>
            <small className="form-hint">
              Separate multiple tags with commas
            </small>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.recurring}
                onChange={(e) =>
                  handleInputChange("recurring", e.target.checked)
                }
              />
              <span className="checkmark"></span>
              Recurring Expense
            </label>
          </div>

          <div className="form-group has-icon">
            <label>Description</label>
            <div className="input-wrapper">
              <FaStickyNote className="input-icon" />
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Add a note about this expense (optional)"
                rows="3"
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <>
                <div className="loading-spinner" />
                {expense ? "Updating..." : "Adding..."}
              </>
            ) : (
              <>{expense ? "Update" : "Add"} Expense</>
            )}
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
};

export default AddExpense;
