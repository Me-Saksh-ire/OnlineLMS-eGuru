import React from "react";
import { Link } from "react-router-dom";
import "./Cart.css";
import { assets } from "../assets/assets";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

const Cart = ({ cartItems, setCartItems, user }) => {
  const navigate = useNavigate();
  const [paying, setPaying] = useState(false);
  const removeItem = (courseId) => {
    setCartItems(
      cartItems.filter((item) => (item._id || item.id) !== courseId),
    );
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.discountPrice || item.price),
    0,
  );
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const handleCheckout = async () => {
    if (!user) return navigate("/login");
    if (cartItems.length === 0) return;

    setPaying(true);
    try {
      // Create one order per course (Razorpay is per-course in your backend)
      for (const course of cartItems) {
        const { data } = await axiosInstance.post("/payment/create-order", {
          courseId: course._id,
        });

        if (!data.success) {
          alert(`Failed to initiate payment for: ${course.title}`);
          continue;
        }

        await new Promise((resolve) => {
          const options = {
            key: data.key,
            amount: data.order.amount,
            currency: data.order.currency,
            name: "EGuru",
            description: course.title,
            image: course.thumbnail,
            order_id: data.order.id,
            handler: async (response) => {
              const verify = await axiosInstance.post("/payment/verify", {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                courseId: course._id,
              });

              if (verify.data.success) {
                // Remove enrolled course from cart
                setCartItems((prev) =>
                  prev.filter(
                    (item) =>
                      (item._id || item.id) !== (course._id || course.id),
                  ),
                );
                alert(`Enrolled in: ${course.title}`);
              } else {
                alert(`Payment verification failed for: ${course.title}`);
              }
              resolve();
            },
            modal: { ondismiss: resolve }, // so loop continues if user closes
            prefill: { name: user.name, email: user.email },
            theme: { color: "#f5a623" },
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        });
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h1 className="fade-in">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="empty-cart fade-in stagger-1">
            <div className="empty-icon">
              <img src={assets.shoppingCart} height="100" alt="" />
            </div>
            <h2>Your cart is empty</h2>
            <p>Start adding courses to your cart!</p>
            <Link to="/courses" className="btn btn-primary">
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items fade-in stagger-1">
              {cartItems.map((course, index) => (
                <div
                  key={course._id || course.id}
                  className={`cart-item fade-in stagger-${index + 2}`}
                >
                  <img
                    src={course.thumbnail}
                    className="title-img"
                    alt={course.title}
                  />
                  <div className="item-details">
                    <h3>{course.title}</h3>
                    <p className="instructor">By {course.instructor.name}</p>
                    <div className="item-meta">
                      <span>⭐ {course.rating || 0}</span>
                      <span>
                        📚 {course.lessons?.length || course.totalLessons || 0}{" "}
                        lessons
                      </span>
                      <span>⏱️ {course.totalDuration}</span>
                    </div>
                  </div>
                  <div className="item-price">
                    <span className="current-price">
                      ₹{course.discountPrice.toLocaleString("en-IN")}
                    </span>
                    <span className="original-price">
                      ₹{course.price?.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <button
                    onClick={() => removeItem(course._id || course.id)}
                    className="remove-btn"
                  >
                    <img src={assets.trash} height="15" alt="" />
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-summary fade-in stagger-2">
              <h2>Order Summary</h2>
              <div className="summary-details">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>
                    ₹
                    {subtotal.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="summary-row">
                  <span>Tax (10%)</span>
                  <span>
                    ₹
                    {tax.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <hr />
                <div className="summary-row total">
                  <span>Total</span>
                  <span>
                    ₹
                    {total.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
              <button
                className="btn btn-primary btn-block"
                onClick={handleCheckout}
                disabled={paying}
              >
                {paying ? "Processing..." : "Proceed to Checkout"}
              </button>
              <Link to="/courses" className="continue-shopping">
                ← Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
