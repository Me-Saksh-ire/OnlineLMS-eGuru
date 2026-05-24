// ═══════════════════════════════════════════════════════════════════════════
// FILE: controllers/enrollmentController.js  (complete, replace yours)
// ═══════════════════════════════════════════════════════════════════════════
import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";
import Lesson from "../models/Lesson.js";
import Payment from "../models/Payment.js";

// POST /api/enrollment/enroll  (student — free courses only)
export const enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const course = await Course.findById(courseId);
    if (!course)
      return res.json({ success: false, message: "Course not found" });

    const existing = await Enrollment.findOne({
      user: req.user.id,
      course: courseId,
    });
    if (existing && existing.paymentStatus === "paid")
      return res.json({
        success: false,
        message: "Already enrolled in this course",
      });

    if (course.price === 0) {
      const enrollment = await Enrollment.create({
        user: req.user.id,
        course: courseId,
        paymentStatus: "paid",
      });

      // ✅ FIX: keep Course.totalStudents in sync
      await Course.findByIdAndUpdate(courseId, { $inc: { totalStudents: 1 } });

      return res.json({
        success: true,
        message: "Enrolled successfully!",
        enrollment,
      });
    }

    return res.json({
      success: false,
      message: "Please complete payment to enroll",
      courseId,
      price: course.price,
    });
  } catch (error) {
    console.log(error.message);
    return res.json({ success: false, message: error.message });
  }
};

// GET /api/enrollment/my  (student)
export const getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({
      user: req.user.id,
      paymentStatus: "paid",
    }).populate({
      path: "course",
      select: "title thumbnail instructor price level lessons",
      populate: { path: "instructor", select: "name email signature" },
    });
    return res.json({ success: true, enrollments });
  } catch (error) {
    console.log(error.message);
    return res.json({ success: false, message: error.message });
  }
};

// GET /api/enrollment/check/:courseId  (student)
export const checkEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: req.params.courseId,
      paymentStatus: "paid",
    });
    return res.json({ success: true, isEnrolled: !!enrollment });
  } catch (error) {
    console.log(error.message);
    return res.json({ success: false, message: error.message });
  }
};

// GET /api/enrollment/course/:courseId  (instructor)
export const getEnrollmentsByCourse = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({
      course: req.params.courseId,
      paymentStatus: "paid",
    }).populate("user", "name email image");
    return res.json({ success: true, enrollments });
  } catch (error) {
    console.log(error.message);
    return res.json({ success: false, message: error.message });
  }
};

// POST /api/enrollment/progress/complete-lesson
export const markLessonComplete = async (req, res) => {
  try {
    const { courseId, lessonId } = req.body;
    if (!courseId || !lessonId)
      return res.json({
        success: false,
        message: "courseId and lessonId required",
      });

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

    const alreadyDone = enrollment.completedLessons
      .map((id) => id.toString())
      .includes(lessonId);

    if (!alreadyDone) {
      enrollment.completedLessons.push(lessonId);
      const totalLessons = await Lesson.countDocuments({ course: courseId });
      if (enrollment.completedLessons.length >= totalLessons) {
        enrollment.completedAt = new Date();
      }
      await enrollment.save();
    }

    return res.json({
      success: true,
      completedLessons: enrollment.completedLessons,
      completedAt: enrollment.completedAt,
    });
  } catch (error) {
    console.log(error.message);
    return res.json({ success: false, message: error.message });
  }
};

// GET /api/enrollment/progress/:courseId
export const getProgress = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: req.params.courseId,
      paymentStatus: "paid",
    });

    if (!enrollment)
      return res.json({ success: false, message: "Not enrolled" });

    const totalLessons = await Lesson.countDocuments({
      course: req.params.courseId,
    });
    const completedCount = enrollment.completedLessons.length;
    const percentage =
      totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
    const isCompleted = completedCount >= totalLessons && totalLessons > 0;

    return res.json({
      success: true,
      completedLessons: enrollment.completedLessons,
      completedCount,
      totalLessons,
      percentage,
      isCompleted,
      completedAt: enrollment.completedAt,
    });
  } catch (error) {
    console.log(error.message);
    return res.json({ success: false, message: error.message });
  }
};

// GET /api/enrollment/instructor/stats
export const getInstructorStats = async (req, res) => {
  try {
    const instructorId = req.user.id;

    const courses = await Course.find({ instructor: instructorId }).select(
      "_id title rating",
    );
    const courseIds = courses.map((c) => c._id);

    if (courseIds.length === 0) {
      return res.json({
        success: true,
        totalStudents: 0,
        totalEarnings: 0,
        avgRating: 0,
        courseStats: [],
      });
    }

    // All paid enrollments for instructor's courses
    const enrollments = await Enrollment.find({
      course: { $in: courseIds },
      paymentStatus: "paid",
    })
      .populate("user", "name email")
      .lean();

    // All paid payments — keep as ObjectId strings for matching
    const payments = await Payment.find({
      course: { $in: courseIds },
      status: "paid",
    })
      .select("course user amount")
      .lean();

    // courseId string → total revenue
    const revenueMap = {};
    payments.forEach((p) => {
      const cid = p.course.toString();
      revenueMap[cid] = (revenueMap[cid] || 0) + (p.amount || 0);
    });

    // userId+courseId → amountPaid (for per-student lookup)
    const paymentLookup = {};
    payments.forEach((p) => {
      const key = `${p.course.toString()}_${p.user.toString()}`;
      paymentLookup[key] = (paymentLookup[key] || 0) + (p.amount || 0);
    });

    // Build per-course map
    const courseMap = {};
    courseIds.forEach((id) => {
      courseMap[id.toString()] = {
        courseId: id.toString(),
        enrolledCount: 0,
        paidCount: 0,
        revenue: revenueMap[id.toString()] || 0,
        students: [],
      };
    });

    enrollments.forEach((e) => {
      const cid = e.course.toString();
      const uid = e.user?._id?.toString();
      if (!courseMap[cid]) return;

      courseMap[cid].enrolledCount += 1;
      courseMap[cid].paidCount += 1;

      const amountPaid = paymentLookup[`${cid}_${uid}`] || 0;

      courseMap[cid].students.push({
        _id: e.user?._id,
        name: e.user?.name || "Unknown",
        email: e.user?.email || "",
        enrolledAt: e.createdAt,
        amountPaid,
        paymentStatus: amountPaid > 0 ? "paid" : "free",
      });
    });

    const courseStats = Object.values(courseMap);
    const totalStudents = courseStats.reduce(
      (acc, cs) => acc + cs.enrolledCount,
      0,
    );
    const totalEarnings = courseStats.reduce((acc, cs) => acc + cs.revenue, 0);
    const avgRating =
      courses.length > 0
        ? (
            courses.reduce((acc, c) => acc + (c.rating || 0), 0) /
            courses.length
          ).toFixed(1)
        : 0;

    return res.json({
      success: true,
      totalStudents,
      totalEarnings,
      avgRating,
      courseStats,
    });
  } catch (err) {
    console.error("getInstructorStats error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
