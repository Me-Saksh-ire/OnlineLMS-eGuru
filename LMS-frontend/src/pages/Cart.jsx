import React from "react";
import { Link } from "react-router-dom";
import "./Cart.css";
import { assets } from "../assets/assets";

const Cart = ({ cartItems, setCartItems }) => {
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
                  key={course.id}
                  className={`cart-item fade-in stagger-₹{index + 2}`}
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
                      ₹{course.discountPrice}
                    </span>
                    <span className="original-price">₹{course.price}</span>
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
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Tax (10%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <hr />
                <div className="summary-row total">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
              <button className="btn btn-primary btn-block">
                Proceed to Checkout
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
