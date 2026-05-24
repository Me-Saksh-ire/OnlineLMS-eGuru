// courseRoutes.js
import express from "express";
import {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  getInstructorCourses,
  togglePublish,
  getStudentCount,
} from "../controllers/courseController.js";
import { protect, isInstructor } from "../middlewares/auth.js";
import { uploadImage } from "../configs/cloudinary.js";

const router = express.Router();

router.get("/all", getAllCourses);
router.get(
  "/instructor/my-courses",
  protect,
  isInstructor,
  getInstructorCourses,
);
router.get("/:id", getCourseById);
router.get("/:id/student-count", getStudentCount);
router.post(
  "/create",
  protect,
  isInstructor,
  uploadImage.single("thumbnail"),
  createCourse,
);
router.put(
  "/:id",
  protect,
  isInstructor,
  uploadImage.single("thumbnail"),
  updateCourse,
);
router.patch("/:id/publish", protect, isInstructor, togglePublish);
router.delete("/:id", protect, isInstructor, deleteCourse);

export default router;
