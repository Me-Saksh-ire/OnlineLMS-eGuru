import React from 'react';
import { Link } from 'react-router-dom';
import './PurchaseHistory.css';
import { purchaseHistory, getCourseById } from '../assets/assets';

const PurchaseHistory = ({ user }) => {
  const userPurchases = purchaseHistory.filter(p => p.userId === user?._id);

  return (
    <div className='purchase-history-page'>
      <div className='history-container'>
        <h1 className='fade-in'>Purchase History</h1>
        <p className='subtitle fade-in stagger-1'>View all your course purchases and transactions</p>

        {userPurchases.length === 0 ? (
          <div className='empty-state fade-in stagger-2'>
            <div className='empty-icon'>📜</div>
            <h3>No purchase history</h3>
            <p>You haven't purchased any courses yet</p>
            <Link to='/courses' className='btn btn-primary'>Start Learning</Link>
          </div>
        ) : (
          <div className='purchases-list'>
            {userPurchases.map((purchase, index) => {
              const course = getCourseById(purchase.courseId);
              return (
                <div key={purchase.id} className={`purchase-card fade-in stagger-₹{index + 2}`}>
                  <div className='purchase-header'>
                    <div>
                      <h3>{purchase.courseName}</h3>
                      <p className='purchase-date'>Purchased on {purchase.purchaseDate}</p>
                    </div>
                    <span className={`status-badge ₹{purchase.status}`}>
                      {purchase.status}
                    </span>
                  </div>

                  <div className='purchase-details'>
                    <div className='detail-item'>
                      <span className='label'>Order ID</span>
                      <span className='value'>{purchase.id}</span>
                    </div>
                    <div className='detail-item'>
                      <span className='label'>Amount</span>
                      <span className='value amount'>₹{purchase.amount}</span>
                    </div>
                    <div className='detail-item'>
                      <span className='label'>Payment Method</span>
                      <span className='value'>{purchase.paymentMethod}</span>
                    </div>
                  </div>

                  <div className='purchase-actions'>
                    <Link to={`/course/₹{purchase.courseId}`} className='btn btn-outline btn-sm'>
                      View Course
                    </Link>
                    <button className='btn btn-secondary btn-sm'>
                      Download Receipt
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseHistory;