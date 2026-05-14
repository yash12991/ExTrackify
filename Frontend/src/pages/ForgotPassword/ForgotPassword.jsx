import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { axiosInstance } from "../../lib/axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await axiosInstance.post("/users/forgot-password", { email });
      setSent(true);
      toast.success("Reset link sent if account exists");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-shapes">
        <div className="shape shape-1" /><div className="shape shape-2" /><div className="shape shape-3" /><div className="shape shape-4" />
      </div>

      <motion.div
        className="login-container"
        style={{ maxWidth: 500, gridTemplateColumns: "1fr" }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="login-form-section" style={{ padding: "60px 40px" }}>
          <div className="form-card" style={{ maxWidth: 380 }}>
            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: "center" }}
              >
                <div style={{
                  width: 72, height: 72, borderRadius: 24,
                  background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 24px", color: "#34d399"
                }}>
                  <CheckCircle size={36} />
                </div>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "white", margin: "0 0 8px" }}>
                  Check Your Email
                </h1>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.95rem", lineHeight: 1.6, margin: "0 0 8px" }}>
                  We sent a password reset link to <strong style={{ color: "rgba(255,255,255,0.7)" }}>{email}</strong>
                </p>
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.85rem", margin: "0 0 32px" }}>
                  Didn't receive it? Check your spam folder or try again.
                </p>
                <Link to="/login" style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  color: "#818cf8", fontWeight: 600, textDecoration: "none", fontSize: "0.9rem"
                }}>
                  <ArrowLeft size={16} /> Back to Login
                </Link>
              </motion.div>
            ) : (
              <>
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: 20,
                    background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 20px", color: "#818cf8"
                  }}>
                    <Mail size={32} />
                  </div>
                  <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "white", margin: "0 0 8px" }}>
                    Forgot Password?
                  </h1>
                  <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.9rem", margin: 0 }}>
                    Enter your email and we'll send you a reset link
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
                    <label htmlFor="email">Email Address</label>
                    <div className="input-wrapper">
                      <Mail size={18} className="input-icon" />
                      <input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(""); }}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <button type="submit" className="login-btn" disabled={isLoading}>
                    {isLoading ? (
                      <span className="btn-loading">
                        <Loader2 size={18} className="spin" />
                        Sending...
                      </span>
                    ) : (
                      <span className="btn-text">
                        Send Reset Link
                      </span>
                    )}
                  </button>
                </form>

                <div className="signup-prompt">
                  <p>
                    Remember your password?{" "}
                    <Link to="/login" className="signup-link" style={{ display: "inline", gap: 0 }}>
                      Sign in
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

export default ForgotPassword;
