import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { register, sendOtp, verifyOtp } from "../../lib/api";
import Loader from "../../components/Loading/Loading";

const Signup = () => {
  const [mincount, setminCount] = useState(5);
  const [seccount, setsecCount] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [resenttimer, setresenttimer] = useState(0);
  const [resendDisabled, setResendDisabled] = useState(false);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1: form, 2: OTP verification
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    let retimer;

    if (resendDisabled && resenttimer > 0) {
      retimer = setTimeout(() => {
        setresenttimer((prevCount) => prevCount - 1);
      }, 1000);
    } else if (resenttimer === 0) {
      setResendDisabled(false);
    }

    return () => clearTimeout(retimer);
  }, [resenttimer, resendDisabled]);

  const startresendcountdown = () => {
    setresenttimer(30);
    setResendDisabled(true);
  };

  useEffect(() => {
    let timer;

    if (timerActive) {
      if (seccount > 0) {
        timer = setTimeout(() => {
          setsecCount((prevCount) => prevCount - 1);
        }, 1000);
      } else if (mincount > 0) {
        setminCount((prevCount) => prevCount - 1);
        setsecCount(59);
      } else {
        setTimerActive(false);
      }
    }

    return () => clearTimeout(timer);
  }, [mincount, seccount, timerActive]);

  const startCountdown = () => {
    setminCount(5);
    setsecCount(0);
    setTimerActive(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value.trim(),
    }));
    if (error) setError("");
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();

    // Validate form first
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
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

    setIsLoading(true);
    setError("");

    try {
      const response = await sendOtp(formData.email);
      console.log("OTP sent successfully:", response);
      toast.success("OTP sent to your email!");
      setStep(2);
      setOtpSent(true);
      startCountdown();
      startresendcountdown();
    } catch (error) {
      console.error("Send OTP error:", error);
      const errorMessage = error.message || "Failed to send OTP";

      // If user already exists, show option to login
      if (errorMessage.includes("already exists")) {
        toast.error("User already exists. Please login instead.");
        // Optionally redirect to login page
        // navigate("/login");
      } else {
        toast.error(errorMessage);
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      console.log("🔄 Verifying OTP and registering...");

      // First verify OTP
      await verifyOtp(formData.email, otp);
      console.log("✅ OTP verified");

      // Then register the user
      const response = await register(formData);
      console.log("✅ Registration successful:", response);

      // For cookie-based auth, we don't need to store tokens manually
      // The httpOnly cookie is automatically set by the browser

      queryClient.invalidateQueries();
      toast.success("Registration successful!");
      navigate("/dashboard");
    } catch (error) {
      console.error("❌ Registration error:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Registration failed";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async () => {
    if (resendDisabled) return;

    try {
      setIsLoading(true);
      setError("");
      await sendOtp(formData.email);
      toast.success("OTP resent successfully!");
      startCountdown();
      startresendcountdown();
    } catch (error) {
      console.error("Resend OTP error:", error);
      const errorMessage = error.message || "Failed to resend OTP";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 1) {
    return (
      <div className="body">
        {isLoading && <Loader />}
        {/* Your existing signup form JSX */}
        <div className="form-container">
          <div className="left-container">
            <h1>Sign Up</h1>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSendOtp}>
              <div className="form-group">
                <label htmlFor="name">FullName</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  minLength={6}
                />
              </div>

              <button type="submit" className="btn" disabled={isLoading}>
                {isLoading ? "Sending OTP..." : "Send OTP"}
              </button>

              <div style={{ textAlign: "center", marginTop: "1rem" }}>
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="hover:underline hover:text-blue-500"
                >
                  Login here
                </Link>
              </div>
            </form>
          </div>
          {/* Right container with welcome message */}
        </div>
      </div>
    );
  }

  return (
    <div className="body">
      {isLoading && <Loader />}
      <div className="form-container">
        <div className="left-container">
          <h1>Verify OTP</h1>
          <p style={{ textAlign: "center" }}>
            We've sent a 6-digit OTP to {formData.email}
          </p>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleVerifyOtp}>
            <div className="form-group">
              <label htmlFor="otp">Enter OTP</label>
              <input
                id="otp"
                type="text"
                name="otp"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                disabled={isLoading}
                maxLength={6}
                style={{
                  textAlign: "center",
                  letterSpacing: "2px",
                  fontSize: "1.2rem",
                }}
              />
            </div>

            <button type="submit" className="btn" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify & Register"}
            </button>

            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <button
                type="button"
                onClick={resendOtp}
                className="bg-zinc-300 rounded"
                disabled={isLoading || resendDisabled}
                style={{
                  background: "none",

                  border: "none",
                  color: resendDisabled ? "#ccc" : "#667eea",
                  textDecoration: "underline",
                  cursor: resendDisabled ? "not-allowed" : "pointer",
                  padding: "0",
                }}
              >
                {resendDisabled
                  ? `Resend OTP in ${resenttimer}s`
                  : "Resend OTP"}
              </button>
              {timerActive && (
                <p style={{ margin: "0.5rem 0", color: "#666" }}>
                  OTP expires in: {mincount}:
                  {seccount.toString().padStart(2, "0")}
                </p>
              )}
            </div>

            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#666",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
              >
                ← Back to form
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
