import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  FaTimes,
  FaRupeeSign,
  FaCalendarAlt,
  FaFileInvoice,
  FaStickyNote,
  // FaRepeat,
  FaExclamationTriangle,
  FaIcons,
  FaTag,
} from "react-icons/fa";

import { TbRepeat } from "react-icons/tb";

import { createBill } from "../../lib/api";
import "./BillForm.css";

const AddBill = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    billName: "",
    amount: "",
    dueDate: "",
    frequency: "monthly",
    category: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const categories = [
    "Utilities",
    "Rent/Mortgage",
    "Insurance",
    "Subscriptions",
    "Internet/Phone",
    "Credit Card",
    "Loan Payment",
    "Healthcare",
    "Education",
    "Entertainment",
    "Food",
    "Transportation",
    "General",
    "Other",
  ];

  const frequencies = [
    { value: "one-time", label: "One Time" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "3months", label: "Every 3 Months" },
    { value: "quaterly", label: "Quarterly" },
    { value: "6months", label: "Every 6 Months" },
    { value: "yearly", label: "Yearly" },
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.billName.trim()) {
      newErrors.billName = "Bill name is required";
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }

    if (!formData.dueDate) {
      newErrors.dueDate = "Due date is required";
    }

    if (!formData.category.trim()) {
      newErrors.category = "Category is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);
    try {
      const billData = {
        ...formData,
        amount: parseFloat(formData.amount),
        dueDate: new Date(formData.dueDate).toISOString(),
      };

      await createBill(billData);
      toast.success("Bill created successfully!");
      onSuccess();
    } catch (error) {
      toast.error(error.message || "Failed to create bill");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  return (
    <div className="modal-overlay">
      <motion.div
        className="modal-content bill-form-modal"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
      >
        <div className="modal-header">
          <h2>
            <FaFileInvoice className="modal-icon" />
            Add New Bill
          </h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bill-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="billName">
                <FaFileInvoice className="label-icon" />
                Bill Name *
              </label>
              <input
                type="text"
                id="billName"
                name="billName"
                value={formData.billName}
                onChange={handleChange}
                placeholder="Enter bill name"
                className={errors.billName ? "error" : ""}
                maxLength={100}
              />
              {errors.billName && (
                <span className="error-message">
                  <FaExclamationTriangle />
                  {errors.billName}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="amount">
                <FaRupeeSign className="label-icon" />
                Amount *
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Enter amount"
                className={errors.amount ? "error" : ""}
                min="0"
                step="0.01"
              />
              {errors.amount && (
                <span className="error-message">
                  <FaExclamationTriangle />
                  {errors.amount}
                </span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dueDate">
                <FaCalendarAlt className="label-icon" />
                Due Date *
              </label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className={errors.dueDate ? "error" : ""}
                min={getMinDate()}
              />
              {errors.dueDate && (
                <span className="error-message">
                  <FaExclamationTriangle />
                  {errors.dueDate}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="frequency">
                <TbRepeat className="label-icon" />
                Frequency
              </label>
              <select
                id="frequency"
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                className="frequency-select"
              >
                {frequencies.map((freq) => (
                  <option key={freq.value} value={freq.value}>
                    {freq.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="category">
              <FaTag className="label-icon" />
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={errors.category ? "error" : ""}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category && (
              <span className="error-message">
                <FaExclamationTriangle />
                {errors.category}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="notes">
              <FaStickyNote className="label-icon" />
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any notes or additional information..."
              rows="4"
              maxLength={500}
            />
            <small className="char-count">
              {formData.notes.length}/500 characters
            </small>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  Creating...
                </div>
              ) : (
                <>
                  <FaFileInvoice />
                  Create Bill
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddBill;
