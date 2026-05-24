// lessonRoutes.js
import express from "express";
import {
  createLesson,
  getLessonsByCourse,
  updateLesson,
  deleteLesson,
} from "../controllers/lessonController.js";
import { protect, isInstructor } from "../middlewares/auth.js";
import { uploadVideo } from "../configs/cloudinary.js";

const router = express.Router();

router.get("/course/:courseId", protect, getLessonsByCourse);
router.post(
  "/create",
  protect,
  isInstructor,
  uploadVideo.single("video"),
  createLesson,
);
router.put(
  "/:id",
  protect,
  isInstructor,
  uploadVideo.single("video"),
  updateLesson,
);
router.delete("/:id", protect, isInstructor, deleteLesson);

export default router;
