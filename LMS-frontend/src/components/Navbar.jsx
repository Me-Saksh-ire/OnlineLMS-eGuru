import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import "./Navbar.css";

const Navbar = ({ cartCount }) => {
  const { user, logout } = useAppContext();
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="nav-logo">
          <div className="nav-logo-icon">
            <svg
              width="18"
              height="18"
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
          <span className="nav-logo-text">EGuru</span>
        </Link>

        {/* Nav Links */}
        <div className="nav-links">
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/courses" className="nav-link">
            Courses
          </Link>
          {user && (
            <Link
              to={
                user.role === "instructor" ? "/teacher" : "/student-dashboard"
              }
              className="nav-link"
            >
              Dashboard
            </Link>
          )}
        </div>

        {/* Right side */}
        <div className="nav-right">
          {/* Cart */}
          <Link to="/cart" className="cart-btn">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          {user ? (
            /* Logged in – avatar + dropdown */
            <div className="user-menu" ref={dropdownRef}>
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="user-avatar"
                  onClick={() => setShowDropdown(!showDropdown)}
                />
              ) : (
                <div
                  className="user-avatar-initials"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
              )}
              {showDropdown && (
                <div className="dropdown-menu">
                  <div className="dropdown-user-info">
                    <p className="dropdown-user-name">{user.name}</p>
                    <p className="dropdown-user-email">{user.email}</p>
                  </div>
                  <hr className="dropdown-divider" />
                  <Link
                    to={
                      user.role === "instructor"
                        ? "/teacher"
                        : "/student-dashboard"
                    }
                    className="dropdown-item"
                    onClick={() => setShowDropdown(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    className="dropdown-item"
                    onClick={() => setShowDropdown(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/my-courses"
                    className="dropdown-item"
                    onClick={() => setShowDropdown(false)}
                  >
                    My Courses
                  </Link>

                  {/* ADD THIS */}
                  <Link
                    to="/purchase-history"
                    className="dropdown-item"
                    onClick={() => setShowDropdown(false)}
                  >
                    Purchase History
                  </Link>

                  <hr className="dropdown-divider" />
                  <button
                    className="dropdown-item logout"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Logged out – Login + Sign Up */
            <>
              <Link to="/login" className="nav-login">
                Login
              </Link>
              <Link
                to="/login"
                state={{ register: true }}
                className="nav-signup"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
