import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { sendOtp, verifyOtp } from "../../lib/api";

const OtpVerification = ({ email, onVerified, onBack }) => {
  const [step, setStep] = useState("send");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(0);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  useEffect(() => {
    if (step === "verify") {
      inputRefs.current[0]?.focus();
    }
  }, [step]);

  const handleSendOtp = async () => {
    setIsLoading(true);
    setError("");
    try {
      await sendOtp(email);
      setStep("verify");
      setTimer(120);
      toast.success("OTP sent to your email");
    } catch (err) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      await verifyOtp(email, code);
      onVerified();
    } catch (err) {
      setError(err.message || "Invalid OTP");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setError("");
    setOtp(["", "", "", "", "", ""]);
    await handleSendOtp();
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="otp-verification"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        {step === "send" ? (
          <motion.div
            key="send-step"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="otp-verify-content"
          >
            <div className="otp-icon-wrapper">
              <Mail size={32} />
            </div>
            <h3>Verify your email</h3>
            <p>We'll send a verification code to <strong>{email}</strong></p>

            <AnimatePresence>
              {error && (
                <motion.div
                  className="otp-error"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              className="otp-send-btn"
              onClick={handleSendOtp}
              disabled={isLoading}
            >
              {isLoading ? (
                <span><Loader2 size={18} className="spin" /> Sending...</span>
              ) : (
                <span>Send Verification Code</span>
              )}
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="verify-step"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="otp-verify-content"
          >
            <div className="otp-icon-wrapper success">
              <CheckCircle size={32} />
            </div>
            <h3>Enter verification code</h3>
            <p>We sent a 6-digit code to <strong>{email}</strong></p>

            <div className="otp-input-group">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  disabled={isLoading}
                  className="otp-digit-input"
                  autoComplete="one-time-code"
                />
              ))}
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  className="otp-error"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              className="otp-verify-btn"
              onClick={handleVerifyOtp}
              disabled={isLoading || otp.join("").length !== 6}
            >
              {isLoading ? (
                <span><Loader2 size={18} className="spin" /> Verifying...</span>
              ) : (
                <span>Verify Email</span>
              )}
            </button>

            <div className="otp-footer">
              <button
                className="otp-resend-btn"
                onClick={handleResend}
                disabled={timer > 0 || isLoading}
              >
                {timer > 0 ? `Resend in ${formatTime(timer)}` : "Resend code"}
              </button>
              <button className="otp-back-btn" onClick={onBack}>
                <ArrowLeft size={14} /> Back
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default OtpVerification;
