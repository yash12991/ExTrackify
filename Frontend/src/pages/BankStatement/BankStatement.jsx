import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaUpload, FaFilePdf, FaFileCsv, FaFileAlt, FaTrash, FaCheck, FaSpinner, FaSave, FaTimes, FaExclamationTriangle, FaArrowLeft, FaFileInvoiceDollar, FaRupeeSign, FaCalendarAlt, FaTag } from "react-icons/fa";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { uploadBankStatement, saveBankTransactions } from "../../lib/api";
import "./BankStatement.css";

const ACCEPTED = ".pdf,.csv,.png,.jpg,.jpeg,.webp,.txt";

const BankStatement = () => {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const fileInputRef = useRef(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(e.type === "dragover");
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  }, []);

  const handleSelect = useCallback((e) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    setResult(null);
    setSaved(false);
    try {
      const res = await uploadBankStatement(file);
      setResult(res.data);
    } catch (err) {
      setError(err.message || "Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!result?.transactions?.length) return;
    setSaving(true);
    try {
      const debits = result.transactions.filter((t) => t.type === "debit");
      await saveBankTransactions(debits);
      setSaved(true);
    } catch (err) {
      setError(err.message || "Failed to save transactions.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (i, t) => {
    setEditingId(i);
    setEditData({ ...t });
  };

  const handleEditChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveEdit = (i) => {
    setResult((prev) => {
      const tx = [...prev.transactions];
      tx[i] = { ...editData, amount: Number(editData.amount) };
      return { ...prev, transactions: tx };
    });
    setEditingId(null);
    setEditData({});
  };

  const handleRemove = (i) => {
    setResult((prev) => {
      const tx = prev.transactions.filter((_, idx) => idx !== i);
      return {
        ...prev,
        totalTransactions: tx.length,
        debits: tx.filter((t) => t.type === "debit").length,
        credits: tx.filter((t) => t.type === "credit").length,
        transactions: tx,
      };
    });
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setSaved(false);
    setEditingId(null);
  };

  const formatDate = (d) => {
    if (!d) return "";
    const date = new Date(d);
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const CATEGORIES = [
    "Food", "Transport", "Shopping", "Bills & Utilities", "Entertainment",
    "Healthcare", "Education", "Rent", "Salary", "Investment", "Transfer",
    "Other Income", "Other Expense",
  ];

  return (
    <DashboardLayout>
      <div className="bank-stmt-page">
        <div className="bank-stmt-header">
          <h1><FaFileInvoiceDollar /> Bank Statement Importer</h1>
          <p>Upload your bank statement (PDF, CSV, or image). AI extracts transactions and saves them as expenses.</p>
        </div>

        {error && (
          <motion.div className="bank-stmt-error" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <FaExclamationTriangle /> {error}
            <button onClick={() => setError(null)}><FaTimes /></button>
          </motion.div>
        )}

        {saved && (
          <motion.div className="bank-stmt-success" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <FaCheck /> Expenses saved successfully!
          </motion.div>
        )}

        {!result && (
          <div className="bank-stmt-upload-area">
            <div
              className={`bank-stmt-dropzone ${dragOver ? "drag-over" : ""}`}
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
              {file ? (
                <div className="bank-stmt-file-selected" onClick={(e) => e.stopPropagation()}>
                  <div className="bank-stmt-file-icon">
                    {file.name.endsWith(".pdf") ? <FaFilePdf /> : file.name.endsWith(".csv") ? <FaFileCsv /> : <FaFileAlt />}
                  </div>
                  <div className="bank-stmt-file-info">
                    <strong>{file.name}</strong>
                    <span>{(file.size / 1024).toFixed(1)} KB</span>
                  </div>
                  <button className="bank-stmt-file-remove" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                    <FaTrash />
                  </button>
                </div>
              ) : (
                <div className="bank-stmt-dropzone-empty">
                  <FaUpload className="bank-stmt-upload-icon" />
                  <p><strong>Click to upload</strong> or drag & drop</p>
                  <span>PDF, CSV, PNG, JPG — up to 10 MB</span>
                </div>
              )}
            </div>
            <motion.button
              className="bank-stmt-upload-btn"
              disabled={!file || uploading}
              onClick={handleUpload}
              whileHover={file && !uploading ? { scale: 1.02 } : {}}
              whileTap={file && !uploading ? { scale: 0.98 } : {}}
            >
              {uploading ? (
                <><FaSpinner className="spin" /> Processing...</>
              ) : (
                <><FaUpload /> Upload & Extract</>
              )}
            </motion.button>
          </div>
        )}

        {result && (
          <motion.div
            className="bank-stmt-result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bank-stmt-result-header">
              <div>
                <h2>{result.fileName}</h2>
                <div className="bank-stmt-summary">
                  <span><strong>{result.totalTransactions}</strong> transactions</span>
                  <span className="bank-stmt-summary-debit"><strong>{result.debits}</strong> debits</span>
                  <span className="bank-stmt-summary-credit"><strong>{result.credits}</strong> credits</span>
                </div>
              </div>
              <div className="bank-stmt-result-actions">
                <button className="bank-stmt-back-btn" onClick={reset}><FaArrowLeft /> New File</button>
                <button
                  className="bank-stmt-save-btn"
                  onClick={handleSave}
                  disabled={saving || saved}
                >
                  {saving ? <><FaSpinner className="spin" /> Saving...</> : saved ? <><FaCheck /> Saved</> : <><FaSave /> Save All Expenses</>}
                </button>
              </div>
            </div>

            <div className="bank-stmt-table-wrap">
              <table className="bank-stmt-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Mode</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {result.transactions.map((t, i) => (
                      <motion.tr
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ delay: i * 0.02 }}
                        className={editingId === i ? "editing" : ""}
                      >
                        {editingId === i ? (
                          <>
                            <td>{i + 1}</td>
                            <td>
                              <input
                                type="date"
                                value={editData.date?.split("T")[0] || ""}
                                onChange={(e) => handleEditChange("date", e.target.value)}
                                className="bank-stmt-edit-input"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                value={editData.description || ""}
                                onChange={(e) => handleEditChange("description", e.target.value)}
                                className="bank-stmt-edit-input"
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                value={editData.amount || ""}
                                onChange={(e) => handleEditChange("amount", e.target.value)}
                                className="bank-stmt-edit-input bank-stmt-edit-amount"
                                step="0.01"
                              />
                            </td>
                            <td>
                              <select
                                value={editData.type || "debit"}
                                onChange={(e) => handleEditChange("type", e.target.value)}
                                className="bank-stmt-edit-input"
                              >
                                <option value="debit">Debit</option>
                                <option value="credit">Credit</option>
                              </select>
                            </td>
                            <td>
                              <select
                                value={editData.category || "Other Expense"}
                                onChange={(e) => handleEditChange("category", e.target.value)}
                                className="bank-stmt-edit-input"
                              >
                                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </td>
                            <td>
                              <input
                                type="text"
                                value={editData.modeofpayment || ""}
                                onChange={(e) => handleEditChange("modeofpayment", e.target.value)}
                                className="bank-stmt-edit-input"
                              />
                            </td>
                            <td>
                              <div className="bank-stmt-edit-actions">
                                <button className="bank-stmt-action-btn save" onClick={() => handleSaveEdit(i)} title="Save"><FaCheck /></button>
                                <button className="bank-stmt-action-btn cancel" onClick={() => setEditingId(null)} title="Cancel"><FaTimes /></button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td>{i + 1}</td>
                            <td><FaCalendarAlt className="bank-stmt-icon" /> {formatDate(t.date)}</td>
                            <td className="bank-stmt-desc">{t.description || "-"}</td>
                            <td className={t.type === "debit" ? "amount-debit" : "amount-credit"}>
                              <FaRupeeSign />{t.amount?.toFixed(2)}
                            </td>
                            <td><span className={`bank-stmt-type ${t.type}`}>{t.type}</span></td>
                            <td><span className="bank-stmt-cat"><FaTag /> {t.category || "-"}</span></td>
                            <td>{t.modeofpayment || "-"}</td>
                            <td>
                              <div className="bank-stmt-action-btns">
                                <button className="bank-stmt-action-btn edit" onClick={() => handleEdit(i, t)} title="Edit"><FaFileAlt /></button>
                                <button className="bank-stmt-action-btn delete" onClick={() => handleRemove(i)} title="Remove"><FaTrash /></button>
                              </div>
                            </td>
                          </>
                        )}
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {result.transactions.length === 0 && (
              <div className="bank-stmt-empty">
                <p>No transactions found in this statement.</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BankStatement;
