import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  FaCamera, FaUpload, FaPlus, FaTimes, FaSpinner, FaCheck, FaImage,
} from "react-icons/fa";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { processReceipt, addExpense } from "../../lib/api";
import "./ReceiptScanner.css";

const ACCEPTED = ".png,.jpg,.jpeg,.webp";
const CATEGORIES = [
  "Food", "Transport", "Shopping", "Bills", "Entertainment",
  "Healthcare", "Education", "Grocery", "Dining", "Utilities", "Other",
];

const ReceiptScanner = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(e.type === "dragover");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f && ACCEPTED.includes(f.name.split(".").pop()?.toLowerCase())) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleSelect = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleProcess = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    setResult(null);
    setSaved(false);
    try {
      const res = await processReceipt(file);
      setResult(res.data);
    } catch (err) {
      setError(err.message || "Failed to process receipt.");
    } finally {
      setProcessing(false);
    }
  };

  const handleAddExpense = async () => {
    if (!result) return;
    setSaving(true);
    try {
      const expenseData = {
        amount: result.total,
        category: result.category,
        notes: result.merchant,
        date: result.date,
        modeofpayment: "Cash",
      };
      await addExpense(expenseData);
      setSaved(true);
    } catch (err) {
      setError(err.message || "Failed to save expense.");
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setSaved(false);
  };

  return (
    <DashboardLayout>
      <div className="receipt-scanner">
        <div className="receipt-header">
          <h1><FaCamera /> Receipt Scanner</h1>
          <p>Upload a receipt image to extract expense data automatically.</p>
        </div>

        {error && (
          <motion.div
            className="receipt-error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span>{error}</span>
            <button onClick={() => setError(null)}><FaTimes /></button>
          </motion.div>
        )}

        {saved && (
          <motion.div
            className="receipt-success"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <FaCheck /> Expense added successfully!
          </motion.div>
        )}

        {!result && (
          <div className="receipt-upload-area">
            <div
              className={`receipt-dropzone ${dragOver ? "drag-over" : ""}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED}
                onChange={handleSelect}
                hidden
              />
              {file && preview ? (
                <div className="receipt-preview" onClick={(e) => e.stopPropagation()}>
                  <img src={preview} alt="Receipt preview" />
                  <button
                    className="receipt-preview-remove"
                    onClick={(e) => { e.stopPropagation(); reset(); }}
                  >
                    <FaTimes />
                  </button>
                </div>
              ) : (
                <div className="receipt-dropzone-empty">
                  <FaImage className="receipt-upload-icon" />
                  <p><strong>Click to upload</strong> or drag & drop</p>
                  <span>PNG, JPG, WEBP — up to 10 MB</span>
                </div>
              )}
            </div>
            <motion.button
              className="receipt-process-btn"
              disabled={!file || processing}
              onClick={handleProcess}
              whileHover={file && !processing ? { scale: 1.02 } : {}}
              whileTap={file && !processing ? { scale: 0.98 } : {}}
            >
              {processing ? (
                <><FaSpinner className="spin" /> Processing...</>
              ) : (
                <><FaUpload /> Process Receipt</>
              )}
            </motion.button>
          </div>
        )}

        {result && (
          <motion.div
            className="receipt-result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="receipt-result-header">
              <h2>Extracted Data</h2>
              <div className="receipt-result-actions">
                <button className="receipt-back-btn" onClick={reset}>
                  <FaTimes /> Clear
                </button>
                <button
                  className="receipt-save-btn"
                  onClick={handleAddExpense}
                  disabled={saving || saved}
                >
                  {saving ? (
                    <><FaSpinner className="spin" /> Saving...</>
                  ) : saved ? (
                    <><FaCheck /> Saved</>
                  ) : (
                    <><FaPlus /> Add as Expense</>
                  )}
                </button>
              </div>
            </div>

            <div className="receipt-data-card">
              <div className="receipt-data-row">
                <span className="receipt-data-label">Merchant</span>
                <span className="receipt-data-value">{result.merchant || "-"}</span>
              </div>
              <div className="receipt-data-row">
                <span className="receipt-data-label">Date</span>
                <span className="receipt-data-value">{result.date || "-"}</span>
              </div>
              <div className="receipt-data-row">
                <span className="receipt-data-label">Total</span>
                <span className="receipt-data-value receipt-data-total">
                  ₹{result.total?.toFixed(2)}
                </span>
              </div>
              <div className="receipt-data-row">
                <span className="receipt-data-label">Category</span>
                <span className="receipt-data-value">{result.category || "-"}</span>
              </div>
            </div>

            {result.items?.length > 0 && (
              <div className="receipt-items-section">
                <h3>Items</h3>
                <div className="receipt-items-list">
                  {result.items.map((item, i) => (
                    <div key={i} className="receipt-item">
                      <span className="receipt-item-name">{item.name}</span>
                      <span className="receipt-item-price">₹{item.price?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ReceiptScanner;
