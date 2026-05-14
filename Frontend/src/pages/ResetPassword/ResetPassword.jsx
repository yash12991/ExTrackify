import React, { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, ArrowLeft, Loader2, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import { toast } from "react-hot-toast";
import { axiosInstance } from "../../lib/axios";
import "../Login/Login.css";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reset, setReset] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await axiosInstance.post("/users/reset-password", { token, newPassword: password });
      setReset(true);
      toast.success("Password reset successfully!");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password. The link may have expired.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="login-page">
        <div className="login-bg-shapes">
          <div className="shape shape-1" /><div className="shape shape-2" /><div className="shape shape-3" /><div className="shape shape-4" />
        </div>
        <motion.div className="login-container" style={{ maxWidth: 500, gridTemplateColumns: "1fr" }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="login-form-section" style={{ padding: "60px 40px" }}>
            <div className="form-card" style={{ maxWidth: 380, textAlign: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "#ef4444" }}>
                <AlertCircle size={32} />
              </div>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "white", margin: "0 0 8px" }}>Invalid Reset Link</h1>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.9rem", margin: "0 0 24px" }}>This password reset link is invalid or has expired.</p>
              <Link to="/forgot-password" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#818cf8", fontWeight: 600, textDecoration: "none", fontSize: "0.9rem" }}>
                <ArrowLeft size={16} /> Request New Link
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-bg-shapes">
        <div className="shape shape-1" /><div className="shape shape-2" /><div className="shape shape-3" /><div className="shape shape-4" />
      </div>
      <motion.div className="login-container" style={{ maxWidth: 500, gridTemplateColumns: "1fr" }}
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="login-form-section" style={{ padding: "60px 40px" }}>
          <div className="form-card" style={{ maxWidth: 380 }}>
            {reset ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center" }}>
                <div style={{ width: 72, height: 72, borderRadius: 24, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", color: "#34d399" }}>
                  <CheckCircle size={36} />
                </div>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "white", margin: "0 0 8px" }}>Password Reset!</h1>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.9rem", margin: "0 0 24px" }}>Redirecting to login...</p>
                <Link to="/login" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#818cf8", fontWeight: 600, textDecoration: "none", fontSize: "0.9rem" }}>
                  <ArrowLeft size={16} /> Go to Login
                </Link>
              </motion.div>
            ) : (
              <>
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                  <div style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "#818cf8" }}>
                    <Lock size={32} />
                  </div>
                  <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "white", margin: "0 0 8px" }}>Reset Password</h1>
                  <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.9rem", margin: 0 }}>
                    Enter your new password for <strong style={{ color: "rgba(255,255,255,0.7)" }}>{email}</strong>
                  </p>
                </div>

                {error && (
                  <div className="error-alert">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div className="input-group">
                    <label htmlFor="password">New Password</label>
                    <div className="input-wrapper">
                      <Lock size={18} className="input-icon" />
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(""); }}
                        required
                        disabled={isLoading}
                        minLength={6}
                      />
                      <button type="button" className="input-icon toggle-password"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", padding: 0 }}>
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="input-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <div className="input-wrapper">
                      <Lock size={18} className="input-icon" />
                      <input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                        required
                        disabled={isLoading}
                        minLength={6}
                      />
                    </div>
                  </div>

                  <button type="submit" className="login-btn" disabled={isLoading}>
                    {isLoading ? (
                      <span className="btn-loading">
                        <Loader2 size={18} className="spin" />
                        Resetting...
                      </span>
                    ) : (
                      <span className="btn-text">
                        Reset Password
                      </span>
                    )}
                  </button>
                </form>

                <div className="signup-prompt">
                  <p>
                    <Link to="/login" className="signup-link" style={{ display: "inline", gap: 0 }}>
                      <ArrowLeft size={14} /> Back to Login
                    </Link>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
