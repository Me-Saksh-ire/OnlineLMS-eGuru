// controllers/ratingController.js

import Rating from "../models/Rating.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";

// POST /api/rating/submit
export const submitRating = async (req, res) => {
  try {
    const { courseId, stars, review } = req.body;
    const userId = req.user.id;

    if (!stars || stars < 1 || stars > 5)
      return res.json({
        success: false,
        message: "Rating must be between 1 and 5",
      });

    // Must be enrolled to rate
    const enrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
      paymentStatus: "paid",
    });
    if (!enrollment)
      return res.json({
        success: false,
        message: "You must be enrolled to rate this course",
      });

    // Upsert — update if exists, create if not
    await Rating.findOneAndUpdate(
      { user: userId, course: courseId },
      { stars, review: review || "", updatedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    // Recalculate course avg rating from all ratings
    const allRatings = await Rating.find({ course: courseId });
    const avg =
      allRatings.reduce((sum, r) => sum + r.stars, 0) / allRatings.length;

    await Course.findByIdAndUpdate(courseId, {
      rating: parseFloat(avg.toFixed(1)),
      totalRatings: allRatings.length,
    });

    return res.json({
      success: true,
      message: "Rating submitted!",
      avgRating: parseFloat(avg.toFixed(1)),
      totalRatings: allRatings.length,
    });
  } catch (error) {
    console.error("submitRating error:", error.message);
    return res.json({ success: false, message: error.message });
  }
};

// GET /api/rating/my/:courseId  — fetch current user's rating for a course
export const getMyRating = async (req, res) => {
  try {
    const rating = await Rating.findOne({
      user: req.user.id,
      course: req.params.courseId,
    });
    return res.json({ success: true, rating: rating || null });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// GET /api/rating/course/:courseId  — all ratings for a course (public)
export const getCourseRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ course: req.params.courseId })
      .populate("user", "name image")
      .sort({ updatedAt: -1 });
    return res.json({ success: true, ratings });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
