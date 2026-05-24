import Lesson from "../models/Lesson.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";

// POST /api/lesson/create  (instructor only)
// expects multipart/form-data with video file
export const createLesson = async (req, res) => {
  try {
    const { title, description, duration, courseId, order, isFree } = req.body;

    if (!title || !courseId || !order)
      return res.json({ success: false, message: "Fill all required fields" });

    const course = await Course.findById(courseId);
    if (!course)
      return res.json({ success: false, message: "Course not found" });
    if (course.instructor.toString() !== req.user.id)
      return res.json({ success: false, message: "Not authorized" });

    // Video uploaded to Cloudinary via multer-storage-cloudinary
    const videoUrl = req.file ? req.file.path : "";
    if (!videoUrl)
      return res.json({ success: false, message: "Video file is required" });

    const lesson = await Lesson.create({
      title,
      description,
      videoUrl,
      duration,
      course: courseId,
      order: Number(order),
      isFree: isFree === "true",
    });

    course.lessons.push(lesson._id);
    await course.save();

    return res.json({ success: true, lesson });
  } catch (error) {
    console.log(error.message);
    return res.json({ success: false, message: error.message });
  }
};

// GET /api/lesson/course/:courseId
export const getLessonsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const lessons = await Lesson.find({ course: courseId }).sort({ order: 1 });
    const course = await Course.findById(courseId);
    if (!course)
      return res.json({ success: false, message: "Course not found" });

    const isInstructor = course.instructor.toString() === req.user.id;
    const enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: courseId,
      paymentStatus: "paid",
    });

    const result = lessons.map((lesson) => {
      if (lesson.isFree || enrollment || isInstructor) return lesson;
      const obj = lesson.toObject();
      return { ...obj, videoUrl: null, locked: true };
    });

    return res.json({ success: true, lessons: result });
  } catch (error) {
    console.log(error.message);
    return res.json({ success: false, message: error.message });
  }
};

// PUT /api/lesson/:id  (instructor only)
export const updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate("course");
    if (!lesson)
      return res.json({ success: false, message: "Lesson not found" });
    if (lesson.course.instructor.toString() !== req.user.id)
      return res.json({ success: false, message: "Not authorized" });

    const videoUrl = req.file ? req.file.path : lesson.videoUrl;
    const updated = await Lesson.findByIdAndUpdate(
      req.params.id,
      { ...req.body, videoUrl },
      { new: true },
    );
    return res.json({ success: true, lesson: updated });
  } catch (error) {
    console.log(error.message);
    return res.json({ success: false, message: error.message });
  }
};

// DELETE /api/lesson/:id
export const deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate("course");
    if (!lesson)
      return res.json({ success: false, message: "Lesson not found" });
    if (lesson.course.instructor.toString() !== req.user.id)
      return res.json({ success: false, message: "Not authorized" });

    await Lesson.findByIdAndDelete(req.params.id);
    await Course.findByIdAndUpdate(lesson.course._id, {
      $pull: { lessons: lesson._id },
    });
    return res.json({ success: true, message: "Lesson deleted successfully" });
  } catch (error) {
    console.log(error.message);
    return res.json({ success: false, message: error.message });
  }
};
