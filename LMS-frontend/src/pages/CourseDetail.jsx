import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "./CourseDetail.css";
import axiosInstance from "../utils/axiosInstance";
import {
  Star,
  Clock,
  Users,
  Award,
  PlayCircle,
  CheckCircle,
  ShoppingCart,
  Check,
  Globe,
  BarChart,
  FileText,
  Download,
  Infinity,
} from "lucide-react";

// ── Tiny reusable star display (read-only) ────────────────────────────────
const StarDisplay = ({ value, size = 14 }) => (
  <span style={{ display: "inline-flex", gap: 1 }}>
    {[1, 2, 3, 4, 5].map((s) => (
      <span
        key={s}
        style={{
          fontSize: size,
          color: s <= Math.round(value) ? "#f59e0b" : "#d1d5db",
          lineHeight: 1,
        }}
      >
        ★
      </span>
    ))}
  </span>
);

const CourseDetail = ({ user, cartItems, setCartItems }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [inCart, setInCart] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  // Real-time student count from enrollment API
  const [liveStudentCount, setLiveStudentCount] = useState(null);

  // Ratings
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    fetchCourse();
    fetchLiveStudentCount();
    fetchReviews();
    if (user) checkIfEnrolled();
  }, [id, user]);

  useEffect(() => {
    if (cartItems && course) {
      setInCart(cartItems.some((item) => item._id === id));
    }
  }, [cartItems, course]);

  const fetchCourse = async () => {
    try {
      const { data } = await axiosInstance.get(`/course/${id}`);
      if (data.success) {
        setCourse(data.course);
        if (data.course.lessons?.length) {
          setLessons(
            [...data.course.lessons].sort(
              (a, b) => Number(a.order) - Number(b.order),
            ),
          );
        }
      }
    } catch (err) {
      console.error("Failed to fetch course", err);
    } finally {
      setLoading(false);
    }
  };

  // ── Real-time enrolled count ──────────────────────────────────────────────
  const fetchLiveStudentCount = async () => {
    try {
      const { data } = await axiosInstance.get(`/course/${id}/student-count`);
      console.log("student count response:", data);
      if (data.success) setLiveStudentCount(data.count);
    } catch (err) {
      console.error("student count error:", err);
    }
  };

  // ── Reviews ───────────────────────────────────────────────────────────────
  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      const { data } = await axiosInstance.get(`/rating/course/${id}`);
      if (data.success) setReviews(data.ratings);
    } catch (err) {
      console.error("Failed to fetch reviews", err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const checkIfEnrolled = async () => {
    try {
      const { data } = await axiosInstance.get(`/enrollment/check/${id}`);
      if (data.success) setIsEnrolled(data.isEnrolled);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddToCart = () => {
    if (!inCart && course) {
      setCartItems([...cartItems, course]);
      setInCart(true);
    }
  };

  const handleBuyNow = async () => {
    if (!user) return navigate("/login");
    setEnrolling(true);
    try {
      const { data } = await axiosInstance.post("/payment/create-order", {
        courseId: course._id,
      });
      if (!data.success) return alert(data.message);

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
            setIsEnrolled(true);
            // bump the live count immediately on successful enroll
            setLiveStudentCount((prev) => (prev !== null ? prev + 1 : prev));
            alert("Enrolled successfully!");
          } else {
            alert("Payment verification failed. Contact support.");
          }
        },
        prefill: { name: user.name, email: user.email },
        theme: { color: "#f5a623" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Try again.");
    } finally {
      setEnrolling(false);
    }
  };

  const handleEnrollFree = async () => {
    if (!user) return navigate("/login");
    setEnrolling(true);
    try {
      const { data } = await axiosInstance.post("/enrollment/enroll", {
        courseId: course._id,
      });
      if (data.success) {
        setIsEnrolled(true);
        setLiveStudentCount((prev) => (prev !== null ? prev + 1 : prev));
        alert("Enrolled for free!");
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading)
    return (
      <div className="loading" style={{ padding: "4rem", textAlign: "center" }}>
        Loading course details...
      </div>
    );

  if (!course)
    return (
      <div className="loading" style={{ padding: "4rem", textAlign: "center" }}>
        Course not found.
      </div>
    );

  const instructor = course.instructor || {};
  const discountedPrice = course.discountPrice || course.price;
  const discountPercent =
    course.discountPrice && course.price > course.discountPrice
      ? Math.round((1 - course.discountPrice / course.price) * 100)
      : null;

  // Use live count if loaded, otherwise fall back to course field
  const studentCount =
    liveStudentCount !== null ? liveStudentCount : (course.totalStudents ?? 0);

  // Rating summary
  const avgRating = course.rating || 0;
  const totalRatings = course.totalRatings || reviews.length || 0;

  // Rating breakdown (count of each star 1–5)
  const breakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.stars === star).length,
  }));

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 4);

  return (
    <div className="course-detail-page">
      {/* ── Hero ── */}
      <div
        className="course-hero"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.9) 100%), url(${course.thumbnail})`,
        }}
      >
        <div className="hero-content fade-in">
          <div className="breadcrumb">
            <Link to="/courses">Courses</Link>
            <span> / </span>
            <Link to={`/courses?category=${course.category?.toLowerCase()}`}>
              {course.category}
            </Link>
            <span> / </span>
            <span>{course.title}</span>
          </div>

          <h1 className="course-title">{course.title}</h1>
          <p className="course-tagline">{course.description}</p>

          <div className="course-meta-bar">
            <div className="meta-item">
              <span className="label">Instructor:</span>
              <div className="instructor-info">
                {instructor.image && (
                  <img src={instructor.image} alt={instructor.name} />
                )}
                <span>{instructor.name || "Unknown"}</span>
              </div>
            </div>

            {/* ── Fixed: was using undefined `cs`, now uses avgRating ── */}
            <div className="meta-item">
              <StarDisplay value={avgRating} />
              <span
                style={{ marginLeft: 4, fontSize: "0.85rem", color: "#fbbf24" }}
              >
                {avgRating > 0 ? avgRating : "N/A"}
              </span>
              {totalRatings > 0 && (
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: "#94a3b8",
                    marginLeft: 4,
                  }}
                >
                  ({totalRatings})
                </span>
              )}
            </div>

            {/* ── Fixed: was using undefined `cs.enrolledCount` ── */}
            <div className="meta-item">
              <span>
                <Users size={13} /> {studentCount.toLocaleString("en-IN")}{" "}
                students
              </span>
            </div>

            <div className="meta-item">
              <span>📚 {lessons.length} lessons</span>
            </div>
            <div className="meta-item">
              <span>🌐 {course.language || "English"}</span>
            </div>
            <div className="meta-item">
              <span>📶 {course.level || "All Levels"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="course-content-wrapper">
        <div className="course-main">
          {/* What You'll Learn */}
          {course.whatYouWillLearn?.length > 0 && (
            <section className="course-section fade-in stagger-2">
              <h2>What You'll Learn</h2>
              <div className="learning-outcomes">
                {course.whatYouWillLearn.map((item, index) => (
                  <div key={index} className="outcome-item">
                    <span className="check-icon">✓</span>
                    <p>{item}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Course Content */}
          <section className="course-section fade-in stagger-3">
            <h2>Course Content</h2>
            <div className="syllabus-list">
              {lessons.length > 0 ? (
                lessons.map((lesson, index) => (
                  <div key={lesson._id} className="syllabus-item">
                    <div className="item-number">
                      {lesson.order || index + 1}
                    </div>
                    <div className="item-content">
                      <h4>{lesson.title}</h4>
                      {lesson.description && <p>{lesson.description}</p>}
                      <div className="item-meta">
                        {lesson.duration && (
                          <span
                            className="duration"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                            }}
                          >
                            <Clock size={16} /> {lesson.duration}
                          </span>
                        )}
                        {lesson.isFree && (
                          <span
                            style={{
                              background: "#10b981",
                              color: "#fff",
                              fontSize: "0.72rem",
                              padding: "0.15rem 0.5rem",
                              borderRadius: "999px",
                              fontWeight: 600,
                            }}
                          >
                            Free Preview
                          </span>
                        )}
                        {lesson.locked && (
                          <span
                            style={{ color: "#9ca3af", fontSize: "0.8rem" }}
                          >
                            🔒 Enroll to watch
                          </span>
                        )}
                      </div>
                    </div>
                    {(lesson.isFree || isEnrolled) && lesson.videoUrl && (
                      <Link
                        to={`/video/${course._id}/${lesson._id}`}
                        className="watch-btn"
                      >
                        Watch
                      </Link>
                    )}
                  </div>
                ))
              ) : (
                <div className="no-content">
                  <p>Course content will be available soon</p>
                </div>
              )}
            </div>
          </section>

          {/* Syllabus */}
          {course.syllabus?.length > 0 && (
            <section className="course-section fade-in stagger-3">
              <h2>Syllabus</h2>
              <ul className="requirements-list">
                {course.syllabus.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Requirements */}
          {course.requirements?.length > 0 && (
            <section className="course-section fade-in stagger-4">
              <h2>Requirements</h2>
              <ul className="requirements-list">
                {course.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </section>
          )}

          {/* About */}
          <section className="course-section fade-in stagger-5">
            <h2>About This Course</h2>
            <div className="course-description">
              <p>{course.description}</p>
            </div>
          </section>

          {/* ── Ratings & Reviews ─────────────────────────────────────────── */}

          <section className="course-section fade-in">
            <h2>Ratings &amp; Reviews</h2>

            {reviewsLoading ? (
              <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                Loading reviews...
              </p>
            ) : reviews.length === 0 ? (
              <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                No reviews yet. Be the first to rate this course!
              </p>
            ) : (
              <>
                {/* Summary row */}
                <div className="cd-rating-summary">
                  <div className="cd-rating-big">
                    <span className="cd-rating-number">{avgRating}</span>
                    <StarDisplay value={avgRating} size={22} />
                    <span className="cd-rating-total">
                      {totalRatings} rating{totalRatings !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Bar breakdown */}
                  <div className="cd-rating-bars">
                    {breakdown.map(({ star, count }) => {
                      const pct =
                        totalRatings > 0
                          ? Math.round((count / totalRatings) * 100)
                          : 0;
                      return (
                        <div key={star} className="cd-bar-row">
                          <span className="cd-bar-label">{star} ★</span>
                          <div className="cd-bar-track">
                            <div
                              className="cd-bar-fill"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="cd-bar-pct">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Individual reviews */}
                <div className="cd-reviews-list">
                  {displayedReviews.map((r) => (
                    <div key={r._id} className="cd-review-card">
                      <div className="cd-review-header">
                        <div className="cd-reviewer-avatar">
                          {r.user?.image ? (
                            <img src={r.user.image} alt={r.user.name} />
                          ) : (
                            <span>
                              {r.user?.name?.[0]?.toUpperCase() || "?"}
                            </span>
                          )}
                        </div>
                        <div className="cd-reviewer-info">
                          <strong>{r.user?.name || "Student"}</strong>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              marginTop: 2,
                            }}
                          >
                            <StarDisplay value={r.stars} size={13} />
                            <span className="cd-review-date">
                              {new Date(r.updatedAt).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      {r.review && <p className="cd-review-text">{r.review}</p>}
                    </div>
                  ))}
                </div>

                {/* Show more / less */}
                {reviews.length > 4 && (
                  <button
                    className="cd-show-more-btn"
                    onClick={() => setShowAllReviews((v) => !v)}
                  >
                    {showAllReviews
                      ? "Show less"
                      : `Show all ${reviews.length} reviews`}
                  </button>
                )}
              </>
            )}
          </section>
        </div>

        {/* ── Sidebar ── */}
        <aside className="course-sidebar fade-in stagger-1">
          <div className="sidebar-card">
            {course.thumbnail && (
              <div className="course-preview">
                <img src={course.thumbnail} alt={course.title} />
              </div>
            )}

            <div className="pricing-info">
              <div className="price-display">
                <span className="current-price">
                  ₹{discountedPrice.toLocaleString("en-IN")}
                </span>
                {discountPercent && (
                  <>
                    <span className="original-price">
                      ₹{course.price?.toLocaleString("en-IN")}
                    </span>
                    <span className="discount-badge">
                      {discountPercent}% OFF
                    </span>
                  </>
                )}
              </div>
              {discountPercent && (
                <p className="price-note">Limited time offer!</p>
              )}
            </div>

            <div className="action-buttons">
              {isEnrolled ? (
                <Link
                  to={`/video/${course._id}/${lessons[0]?._id}`}
                  className="btn btn-primary btn-block"
                >
                  Continue Learning
                </Link>
              ) : course.price === 0 ? (
                <button
                  onClick={handleEnrollFree}
                  disabled={enrolling}
                  className="btn btn-primary btn-block"
                >
                  {enrolling ? "Enrolling..." : "Enroll for Free"}
                </button>
              ) : (
                <>
                  {inCart ? (
                    <Link to="/cart" className="btn btn-primary btn-block">
                      Go to Cart
                    </Link>
                  ) : (
                    <button
                      onClick={handleAddToCart}
                      className="btn btn-outline btn-block"
                    >
                      Add to Cart
                    </button>
                  )}
                  <button
                    onClick={handleBuyNow}
                    disabled={enrolling}
                    className="btn btn-primary btn-block"
                  >
                    {enrolling ? "Processing..." : "Buy Now"}
                  </button>
                </>
              )}
            </div>

            <div className="course-includes">
              <h4>This course includes:</h4>
              <ul>
                <li>📚 {lessons.length} lessons</li>
                <li>🏆 Certificate of completion</li>
                <li>♾️ Lifetime access</li>
                <li>📱 Access on mobile and desktop</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CourseDetail;
