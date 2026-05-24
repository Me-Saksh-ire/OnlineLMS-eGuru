import React, { useState, useEffect } from "react";
import "./Login.css";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { useAppContext } from "../context/AppContext";
import { toast } from "react-hot-toast";

const Login = () => {
  const [state, setState] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setUser, setToken } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.register) {
      setState("register");
    } else {
      setState("login");
    }
    if (location.state?.role) setRole(location.state.role);
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = state === "login" ? "/auth/login" : "/auth/register";
      const payload =
        state === "login"
          ? { email, password }
          : { name, email, password, role };

      const { data } = await axiosInstance.post(endpoint, payload);

      if (data.success) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        setToken(data.accessToken);
        setUser(data.user);
        navigate(
          data.user.role === "instructor" ? "/teacher" : "/student-dashboard",
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      {/* Left: Form */}
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
          {state === "login" ? "Welcome back" : "Create account"}
        </h1>
        <p className="auth-subtitle">
          {state === "login"
            ? "Enter your credentials to access your account"
            : "Join thousands of learners on EGuru"}
        </p>

        {state === "register" && (
          <div className="role-toggle">
            <button
              className={`role-btn ${role === "student" ? "active" : ""}`}
              type="button"
              onClick={() => setRole("student")}
            >
              Student
            </button>
            <button
              className={`role-btn ${role === "instructor" ? "active" : ""}`}
              type="button"
              onClick={() => setRole("instructor")}
            >
              Instructor
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {state === "register" && (
            <div className="field">
              <label>Full Name</label>
              <div className="input-wrap">
                <span className="field-icon">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="8" r="5" />
                    <path d="M20 21a8 8 0 0 0-16 0" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="field">
            <label>Email</label>
            <div className="input-wrap">
              <span className="field-icon">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                </svg>
              </span>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="field">
            <label>Password</label>
            <div className="input-wrap">
              <span className="field-icon">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading
              ? "Please wait..."
              : state === "login"
                ? "Login"
                : "Create Account"}
          </button>
        </form>

        <p className="toggle-link">
          {state === "login"
            ? "Don't have an account? "
            : "Already have an account? "}
          <span
            onClick={() => {
              setState(state === "login" ? "register" : "login");
              navigate("/login", { replace: true, state: {} });
            }}
          >
            {state === "login" ? "Sign up" : "Login"}
          </span>
        </p>
      </div>

      {/* Right: Banner */}
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

export default Login;
