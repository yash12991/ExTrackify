import React, { useState } from "react";
import {
  FaPlus,
  FaEdit,
  FaRupeeSign,
  FaCalendarAlt,
  FaBullseye,
  FaClock,
} from "react-icons/fa";
import "./SIPForm.css";

const SIPForm = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isEditing = false,
}) => {
  const [formData, setFormData] = useState({
    sipName: initialData?.sipName || "",
    amount: initialData?.amount?.toString() || "",
    startDate: initialData?.startDate
      ? new Date(initialData.startDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    durationInMonths: initialData?.durationInMonths || 12,
    frequency: initialData?.frequency || "monthly",
    goal: initialData?.goal || "",
    notes: initialData?.notes || "",
    expectedRate: initialData?.expectedRate || 12,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const calculateExpectedMaturity = () => {
    const amount = parseFloat(formData.amount) || 0;
    const rate = parseFloat(formData.expectedRate) || 0;
    const duration = parseInt(formData.durationInMonths) || 0;
    const frequency = formData.frequency || "monthly";

    if (!amount || !rate || !duration) return 0;

    let maturityValue = 0;

    switch (frequency) {
      case "monthly": {
        const monthlyRate = rate / 12 / 100;
        maturityValue =
          amount *
          (((Math.pow(1 + monthlyRate, duration) - 1) / monthlyRate) *
            (1 + monthlyRate));
        break;
      }
      case "quarterly": {
        const quarterlyRate = rate / 4 / 100;
        const quarterlyDuration = Math.ceil(duration / 3);
        maturityValue =
          amount *
          (((Math.pow(1 + quarterlyRate, quarterlyDuration) - 1) /
            quarterlyRate) *
            (1 + quarterlyRate));
        break;
      }
      case "yearly": {
        const annualRate = rate / 100;
        const yearlyDuration = Math.ceil(duration / 12);
        maturityValue =
          amount *
          (((Math.pow(1 + annualRate, yearlyDuration) - 1) / annualRate) *
            (1 + annualRate));
        break;
      }
      default: {
        const defaultMonthlyRate = rate / 12 / 100;
        maturityValue =
          amount *
          (((Math.pow(1 + defaultMonthlyRate, duration) - 1) /
            defaultMonthlyRate) *
            (1 + defaultMonthlyRate));
      }
    }

    return maturityValue;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      amount: Number(formData.amount),
      durationInMonths: Number(formData.durationInMonths),
      expectedRate: Number(formData.expectedRate),
    };
    onSubmit(submitData);
  };

  if (!isOpen) return null;

  return (
    <div className="sip-form-overlay" onClick={onClose}>
      <div className="sip-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sip-form-header">
          <h3>
            {isEditing ? <FaEdit /> : <FaPlus />}
            {isEditing ? "Edit SIP" : "Create New SIP"}
          </h3>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="sip-form-content">
          <div className="form-section">
            <div className="form-group">
              <label htmlFor="sipName">
                <FaBullseye className="form-icon" />
                SIP Name *
              </label>
              <input
                type="text"
                id="sipName"
                name="sipName"
                value={formData.sipName}
                onChange={handleInputChange}
                placeholder="e.g., Retirement Fund"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="amount">
                  <FaRupeeSign className="form-icon" />
                  Amount *
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="5000"
                  min="1000"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="expectedRate">
                  <FaClock className="form-icon" />
                  Expected Rate (%) *
                </label>
                <input
                  type="number"
                  id="expectedRate"
                  name="expectedRate"
                  value={formData.expectedRate}
                  onChange={handleInputChange}
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
                <label htmlFor="startDate">
                  <FaCalendarAlt className="form-icon" />
                  Start Date *
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="durationInMonths">
                  <FaClock className="form-icon" />
                  Investment Duration *
                </label>
                <select
                  id="durationInMonths"
                  name="durationInMonths"
                  value={formData.durationInMonths}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Duration</option>
                  <option value={6}>6 Months (Short Term)</option>
                  <option value={12}>1 Year</option>
                  <option value={18}>1.5 Years</option>
                  <option value={24}>2 Years</option>
                  <option value={36}>3 Years (Recommended)</option>
                  <option value={48}>4 Years</option>
                  <option value={60}>5 Years (Long Term)</option>
                  <option value={84}>7 Years</option>
                  <option value={120}>10 Years</option>
                  <option value={180}>15 Years</option>
                  <option value={240}>20 Years</option>
                  <option value={300}>25 Years</option>
                  <option value={360}>30 Years (Retirement)</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="frequency">
                  <FaClock className="form-icon" />
                  Frequency
                </label>
                <select
                  id="frequency"
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleInputChange}
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="goal">
                  <FaBullseye className="form-icon" />
                  Investment Goal
                </label>
                <input
                  type="text"
                  id="goal"
                  name="goal"
                  value={formData.goal}
                  onChange={handleInputChange}
                  placeholder="e.g., Retirement"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes (Optional)</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
                placeholder="Add any additional notes..."
              />
            </div>

            <div className="expected-return-section">
              <h4>Expected Maturity Value</h4>
              <div className="return-display">
                <span className="return-amount">
                  ₹
                  {formData.amount &&
                  formData.expectedRate &&
                  formData.durationInMonths
                    ? Math.round(calculateExpectedMaturity()).toLocaleString()
                    : "0"}
                </span>
                <small>Based on {formData.expectedRate}% annual return</small>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-button">
              {isEditing ? "Update SIP" : "Create SIP"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SIPForm;
