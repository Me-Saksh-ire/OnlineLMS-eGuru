import express from "express";
import {
  enrollInCourse,
  getMyEnrollments,
  checkEnrollment,
  getEnrollmentsByCourse,
  markLessonComplete,
  getProgress,
  getInstructorStats,
} from "../controllers/enrollmentController.js";
import { protect, isInstructor } from "../middlewares/auth.js";

const router = express.Router();

router.post("/enroll", protect, enrollInCourse);
router.get("/my", protect, getMyEnrollments);
router.get("/instructor/stats", protect, isInstructor, getInstructorStats); // ← add this, BEFORE /:courseId routes
router.get("/check/:courseId", protect, checkEnrollment);
router.get("/course/:courseId", protect, isInstructor, getEnrollmentsByCourse);
router.post("/progress/complete-lesson", protect, markLessonComplete);
router.get("/progress/:courseId", protect, getProgress);

export default router;
