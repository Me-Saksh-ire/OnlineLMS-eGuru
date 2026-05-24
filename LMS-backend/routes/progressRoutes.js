import express from "express";
import {
  markLessonComplete,
  getCourseProgress,
} from "../controllers/progressController.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

router.post("/complete", protect, markLessonComplete); // student
router.get("/:courseId", protect, getCourseProgress); // student

export default router;
