import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { login } from "../../lib/api";
import Loader from "../../components/Loading/Loading";
import "./Login.css";
import img from "../../assets/image.png";
const Login = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Clear error when component unmounts
  useEffect(() => {
    return () => setError("");
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value.trim(), // Remove whitespace
    }));
    if (error) setError("");
  };

  // Add mobile detection and token handling
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  };

  // Only if cookies fail on mobile, then fallback to localStorage
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      console.log("🔄 Attempting login...", { isMobile: isMobileDevice() });
      const response = await login(formData);
      console.log("✅ Login successful:", response);

      // Check if cookies were set successfully
      // If not (mobile browser blocking), fallback to localStorage
      setTimeout(() => {
        if (
          !document.cookie.includes("accessToken") &&
          response.data?.accessToken
        ) {
          console.log("📱 Cookies blocked, using localStorage fallback");
          localStorage.setItem("accessToken", response.data.accessToken);
        }
      }, 100);

      // The backend automatically sets httpOnly cookies for both PC and mobile
      // No manual token storage needed - cookies work on both platforms

      // Clear any cached data and redirect
      queryClient.invalidateQueries();
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      console.error("❌ Login error:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Login failed";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      {isLoading && <Loader />}
      
      <div className="login-container">
        <div className="login-left">
          <div className="login-brand" onClick={() => navigate("/")}>
            <img src={img} alt="ExTrackify Logo" className="brand-logo" />
            <h1 className="brand-name">EXTRAKIFY</h1>
          </div>
          
          <div className="login-illustration">
            <div className="floating-card">
              <div className="card-icon">💰</div>
              <p>Track Expenses</p>
            </div>
            <div className="floating-card">
              <div className="card-icon">📊</div>
              <p>Analyze Spending</p>
            </div>
            <div className="floating-card">
              <div className="card-icon">🎯</div>
              <p>Achieve Goals</p>
            </div>
          </div>
          
          <div className="login-tagline">
            <h2>Manage Your Finances Smarter</h2>
            <p>Take control of your money with powerful expense tracking and insights</p>
          </div>
        </div>

        <div className="login-right">
          <div className="login-form-wrapper">
            <div className="login-header">
              <h1>Welcome Back</h1>
              <p>Please login to your account</p>
            </div>

            {error && (
              <div className="error-alert" role="alert">
                <span className="error-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="login-form">
              <div className="input-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                  <span className="input-icon">✉️</span>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    minLength={6}
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <div className="form-footer">
                <Link to="#" className="forgot-link">
                  Forgot Password?
                </Link>
              </div>

              <button type="submit" className="login-btn" disabled={isLoading}>
                {isLoading ? (
                  <span className="btn-loading">
                    <span className="spinner"></span>
                    Logging in...
                  </span>
                ) : (
                  <span>Login</span>
                )}
              </button>
            </form>

            <div className="signup-prompt">
              <p>Don't have an account? <Link to="/signup" className="signup-link">Sign up</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
