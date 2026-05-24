import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./PurchaseHistory.css";
import axiosInstance from "../utils/axiosInstance";

const PurchaseHistory = ({ user }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchPayments();
  }, [user]);

  const fetchPayments = async () => {
    try {
      const { data } = await axiosInstance.get("/payment/my");
      if (data.success) setPayments(data.payments);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="purchase-history-page">Loading...</div>;

  return (
    <div className="purchase-history-page">
      <div className="history-container">
        <h1 className="fade-in">Purchase History</h1>
        <p className="subtitle fade-in stagger-1">
          View all your course purchases and transactions
        </p>

        {payments.length === 0 ? (
          <div className="empty-state fade-in stagger-2">
            <div className="empty-icon">📜</div>
            <h3>No purchase history</h3>
            <p>You haven't purchased any courses yet</p>
            <Link to="/courses" className="btn btn-primary">
              Start Learning
            </Link>
          </div>
        ) : (
          <div className="purchases-list">
            {payments.map((payment, index) => (
              <div
                key={payment._id}
                className={`purchase-card fade-in stagger-${index + 2}`}
              >
                <div className="purchase-header">
                  <div>
                    <h3>{payment.course?.title || "Course"}</h3>
                    <p className="purchase-date">
                      Purchased on{" "}
                      {new Date(payment.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span className="status-badge paid">Paid</span>
                </div>

                <div className="purchase-details">
                  <div className="detail-item">
                    <span className="label">Order ID</span>
                    <span className="value">{payment.razorpayOrderId}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Amount</span>
                    <span className="value amount">
                      ₹{payment.amount?.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Payment Method</span>
                    <span className="value">Razorpay</span>
                  </div>
                </div>

                <div className="purchase-actions">
                  <Link
                    to={`/course/${payment.course?._id}`}
                    className="btn btn-outline btn-sm"
                  >
                    View Course
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseHistory;
