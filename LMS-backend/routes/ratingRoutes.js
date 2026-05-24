import express from "express";
import { protect } from "../middlewares/auth.js";
import {
  submitRating,
  getMyRating,
  getCourseRatings,
} from "../controllers/ratingController.js";

const router = express.Router();

router.post("/submit", protect, submitRating);
router.get("/my/:courseId", protect, getMyRating);
router.get("/course/:courseId", getCourseRatings); // public

export default router;
