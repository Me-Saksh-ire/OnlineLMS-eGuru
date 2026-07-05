import React, { useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-hot-toast";

const ForgotPassword = () => {
  const [step, setStep] = useState("email"); // email -> otp -> reset
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axiosInstance.post("/auth/forgot-password", {
        email,
      });
      if (data.success) {
        toast.success(data.message);
        setStep("otp");
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Something went wrong");
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axiosInstance.post("/auth/verify-otp", {
        email,
        otp,
      });
      if (data.success) {
        setStep("reset");
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Something went wrong");
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const { data } = await axiosInstance.post("/auth/reset-password", {
        email,
        otp,
        newPassword,
      });
      if (data.success) {
        toast.success("Password reset! Please login.");
        navigate("/login");
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Something went wrong");
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0d0f1a"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <span className="auth-logo-text">EGuru</span>
        </div>

        <h1 className="auth-title">
          {step === "email" && "Forgot password"}
          {step === "otp" && "Enter OTP"}
          {step === "reset" && "Set new password"}
        </h1>
        <p className="auth-subtitle">
          {step === "email" && "Enter your email to receive a reset OTP"}
          {step === "otp" && `We sent a 6-digit code to ${email}`}
          {step === "reset" && "Choose a strong new password"}
        </p>

        {step === "email" && (
          <form onSubmit={handleSendOtp}>
            <div className="field">
              <label>Email</label>
              <div className="input-wrap">
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOtp}>
            <div className="field">
              <label>OTP</label>
              <div className="input-wrap">
                <input
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        )}

        {step === "reset" && (
          <form onSubmit={handleResetPassword}>
            <div className="field">
              <label>New Password</label>
              <div className="input-wrap">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="field">
              <label>Confirm Password</label>
              <div className="input-wrap">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        <p className="toggle-link">
          <span onClick={() => navigate("/login")}>Back to Login</span>
        </p>
      </div>

      <div className="auth-right">
        <div className="banner-content">
          <div className="banner-icon">
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#f5a623"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <h2 className="banner-title">
            Start Learning <span>Today</span>
          </h2>
          <p className="banner-desc">
            Join thousands of students and unlock your potential with expert-led
            courses
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
