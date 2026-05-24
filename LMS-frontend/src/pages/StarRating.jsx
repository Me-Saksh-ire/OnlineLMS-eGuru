import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-hot-toast";
import "./StarRating.css";

const StarRating = ({ courseId, isEnrolled }) => {
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(0);
  const [review, setReview] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [avgRating, setAvgRating] = useState(null);
  const [totalRatings, setTotalRatings] = useState(0);

  // Load existing rating on mount
  useEffect(() => {
    if (!isEnrolled || !courseId) return;
    axiosInstance
      .get(`/rating/my/${courseId}`)
      .then(({ data }) => {
        if (data.success && data.rating) {
          setSelected(data.rating.stars);
          setReview(data.rating.review || "");
          setSubmitted(true);
        }
      })
      .catch(() => {});
  }, [courseId, isEnrolled]);

  const handleSubmit = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const { data } = await axiosInstance.post("/rating/submit", {
        courseId,
        stars: selected,
        review,
      });
      if (data.success) {
        setSubmitted(true);
        setShowForm(false);
        setAvgRating(data.avgRating);
        setTotalRatings(data.totalRatings);
      }
    } catch (err) {
      console.error("Rating submit failed:", err);
      toast.error("Failed to submit rating.");
    } finally {
      setLoading(false);
    }
  };

  if (!isEnrolled) return null;

  const display = hovered || selected;

  const labels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

  return (
    <div className="sr-wrap">
      {/* ── Collapsed state: show current rating + edit button ── */}
      {submitted && !showForm ? (
        <div className="sr-submitted">
          <div className="sr-stars-row">
            {[1, 2, 3, 4, 5].map((s) => (
              <span
                key={s}
                className={`sr-star sr-star--static ${s <= selected ? "sr-star--filled" : ""}`}
              >
                ★
              </span>
            ))}
          </div>
          <span className="sr-submitted-label">Your rating: {selected}/5</span>
          <button className="sr-edit-btn" onClick={() => setShowForm(true)}>
            Edit
          </button>
        </div>
      ) : (
        /* ── Rating form ── */
        <div className="sr-form">
          <p className="sr-prompt">
            {submitted ? "Update your rating" : "Enjoying the course? Rate it!"}
          </p>

          {/* Stars */}
          <div className="sr-stars-row">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                className={`sr-star ${s <= display ? "sr-star--filled" : ""}`}
                onMouseEnter={() => setHovered(s)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setSelected(s)}
                aria-label={`${s} star`}
              >
                ★
              </button>
            ))}
            {display > 0 && <span className="sr-label">{labels[display]}</span>}
          </div>

          {/* Optional review text */}
          {selected > 0 && (
            <textarea
              className="sr-review"
              placeholder="Leave a review (optional)"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              maxLength={500}
              rows={3}
            />
          )}

          <div className="sr-actions">
            {submitted && (
              <button
                className="sr-cancel-btn"
                onClick={() => {
                  setShowForm(false);
                  setHovered(0);
                }}
              >
                Cancel
              </button>
            )}
            <button
              className="sr-submit-btn"
              onClick={handleSubmit}
              disabled={!selected || loading}
            >
              {loading
                ? "Saving..."
                : submitted
                  ? "Update Rating"
                  : "Submit Rating"}
            </button>
          </div>

          {avgRating !== null && (
            <p className="sr-avg">
              Course avg: ⭐ {avgRating} ({totalRatings} rating
              {totalRatings !== 1 ? "s" : ""})
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default StarRating;
