import Progress from "../models/Progress.js";
import Lesson from "../models/Lesson.js";
import Enrollment from "../models/Enrollment.js";

// POST /api/progress/complete  (student)
export const markLessonComplete = async (req, res) => {
  try {
    const { courseId, lessonId } = req.body;

    const enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: courseId,
      paymentStatus: "paid",
    });
    if (!enrollment)
      return res.json({
        success: false,
        message: "Not enrolled in this course",
      });

    let progress = await Progress.findOne({
      user: req.user.id,
      course: courseId,
    });

    if (!progress) {
      progress = await Progress.create({
        user: req.user.id,
        course: courseId,
        completedLessons: [lessonId],
        lastAccessed: new Date(),
      });
    } else {
      if (!progress.completedLessons.includes(lessonId)) {
        progress.completedLessons.push(lessonId);
      }
      progress.lastAccessed = new Date();
      await progress.save();
    }

    return res.json({
      success: true,
      message: "Lesson marked as complete",
      progress,
    });
  } catch (error) {
    console.log(error.message);
    return res.json({ success: false, message: error.message });
  }
};

// GET /api/progress/:courseId  (student)
export const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;

    const totalLessons = await Lesson.countDocuments({ course: courseId });
    const progress = await Progress.findOne({
      user: req.user.id,
      course: courseId,
    });

    const completedCount = progress ? progress.completedLessons.length : 0;
    const percentage =
      totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    return res.json({
      success: true,
      completedLessons: progress?.completedLessons || [],
      completedCount,
      totalLessons,
      percentage,
      lastAccessed: progress?.lastAccessed || null,
    });
  } catch (error) {
    console.log(error.message);
    return res.json({ success: false, message: error.message });
  }
};
