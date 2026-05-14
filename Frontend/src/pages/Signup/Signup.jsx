import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import { register } from "../../lib/api";
import OtpVerification from "../../components/auth/OtpVerification";
import Loader from "../../components/Loading/Loading";
import "./Signup.css";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 14 } },
};

const Signup = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showOtp, setShowOtp] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleRegister = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await register(formData);
      queryClient.invalidateQueries();
      toast.success("Registration successful! Welcome to ExTrackify!");
      navigate("/dashboard");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Registration failed";
      if (errorMessage.includes("already exists")) {
        toast.error("User already exists. Please login instead.");
      } else {
        toast.error(errorMessage);
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setShowOtp(true);
  };

  const handleOtpVerified = async () => {
    await handleRegister();
  };

  return (
    <div className="signup-page">
      <div className="signup-bg-shapes">
        <div className="shape shape-1" />
        <div className="shape shape-2" />
        <div className="shape shape-3" />
      </div>

      <motion.div
        className="signup-container"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div className="signup-left" variants={itemVariants}>
          <div className="signup-brand" onClick={() => navigate("/")}>
            <div className="brand-mark">EX</div>
            <span className="brand-name">EXTRAKIFY</span>
          </div>

          <div className="signup-illustration">
            {[
              { icon: "🚀", text: "Get Started Fast" },
              { icon: "🔐", text: "Secure & Private" },
              { icon: "📱", text: "Access Anywhere" },
            ].map((item, i) => (
              <motion.div
                className="floating-card"
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <span className="card-icon">{item.icon}</span>
                <p>{item.text}</p>
              </motion.div>
            ))}
          </div>

          <div className="signup-tagline">
            <h2>Join ExTrackify Today</h2>
            <p>Create your account and start managing your finances like a pro</p>
          </div>
        </motion.div>

        <div className="signup-right">
          <div className="signup-form-wrapper">
            <div className="signup-header">
              <h1>{showOtp ? "Verify Email" : "Create Account"}</h1>
              <p>
                {showOtp
                  ? "Check your email for the verification code"
                  : "Fill in your details to get started"}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {showOtp ? (
                <OtpVerification
                  key="otp"
                  email={formData.email}
                  onVerified={handleOtpVerified}
                  onBack={() => setShowOtp(false)}
                />
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  {error && (
                    <div className="error-alert" role="alert">
                      <span className="error-icon">⚠️</span>
                      <span>{error}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} noValidate className="signup-form">
                    <div className="input-group">
                      <label htmlFor="name">Full Name</label>
                      <div className="input-wrapper">
                        <User size={18} className="input-icon" />
                        <input
                          id="name"
                          type="text"
                          name="name"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="input-group">
                      <label htmlFor="email">Email Address</label>
                      <div className="input-wrapper">
                        <Mail size={18} className="input-icon" />
                        <input
                          id="email"
                          type="email"
                          name="email"
                          placeholder="you@example.com"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="input-group">
                      <label htmlFor="password">Password</label>
                      <div className="input-wrapper">
                        <Lock size={18} className="input-icon" />
                        <input
                          id="password"
                          type="password"
                          name="password"
                          placeholder="Minimum 6 characters"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          disabled={isLoading}
                          minLength={6}
                        />
                      </div>
                    </div>

                    <div className="input-group">
                      <label htmlFor="confirmPassword">Confirm Password</label>
                      <div className="input-wrapper">
                        <Lock size={18} className="input-icon" />
                        <input
                          id="confirmPassword"
                          type="password"
                          name="confirmPassword"
                          placeholder="Re-enter your password"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                          disabled={isLoading}
                          minLength={6}
                        />
                      </div>
                    </div>

                    <button type="submit" className="signup-btn" disabled={isLoading}>
                      {isLoading ? (
                        <span className="btn-loading">
                          <Loader2 size={18} className="spin" />
                          Creating Account...
                        </span>
                      ) : (
                        <span className="btn-text">
                          Continue
                          <ArrowRight size={18} />
                        </span>
                      )}
                    </button>
                  </form>

                  <div className="login-prompt">
                    <p>
                      Already have an account?{" "}
                      <Link to="/login" className="login-link">
                        Login
                      </Link>
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
