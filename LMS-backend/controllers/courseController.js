import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";

// POST /api/course/create  (instructor only)
export const createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      discountPrice,
      category,
      level,
      syllabus,
      requirements,
      whatYouWillLearn,
      language,
    } = req.body;

    if (!title || !description || !price || !category)
      return res.json({ success: false, message: "Fill all required fields" });

    const thumbnail = req.file ? req.file.path : "";

    // FormData sends arrays as JSON strings
    const parse = (val) => {
      if (!val) return [];
      try {
        return JSON.parse(val);
      } catch {
        return [val];
      }
    };

    const course = await Course.create({
      title,
      description,
      price,
      discountPrice,
      category,
      level,
      thumbnail,
      syllabus: parse(syllabus),
      requirements: parse(requirements),
      whatYouWillLearn: parse(whatYouWillLearn),
      language: language || "English",
      instructor: req.user.id,
      isPublished: true,
    });

    return res.json({ success: true, course });
  } catch (error) {
    console.error(error && error.stack ? error.stack : error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// GET /api/course/all  (public)
export const getAllCourses = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;
    const query = { isPublished: true };
    if (category && category !== "All") query.category = category;
    if (search) query.title = { $regex: search, $options: "i" };
    const courses = await Course.find(query)
      .populate("instructor", "name image bio signature")
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Course.countDocuments(query);
    return res.json({ success: true, courses, total, page: Number(page) });
  } catch (error) {
    console.log(error.message);
    return res.json({ success: false, message: error.message });
  }
};

// GET /api/course/instructor/my-courses  (instructor only) — must be before /:id
export const getInstructorCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user.id }).populate(
      "lessons",
    );
    return res.json({ success: true, courses });
  } catch (error) {
    console.log(error.message);
    return res.json({ success: false, message: error.message });
  }
};

// GET /api/course/:id  (public)
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("instructor", "name image bio signature")
      .populate("lessons");
    if (!course)
      return res.json({ success: false, message: "Course not found" });
    return res.json({ success: true, course });
  } catch (error) {
    console.log(error.message);
    return res.json({ success: false, message: error.message });
  }
};

// PUT /api/course/:id  (instructor only)
export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course)
      return res.json({ success: false, message: "Course not found" });
    if (course.instructor.toString() !== req.user.id)
      return res.json({ success: false, message: "Not authorized" });
    const thumbnail = req.file ? req.file.path : course.thumbnail;
    const updated = await Course.findByIdAndUpdate(
      req.params.id,
      { ...req.body, thumbnail },
      { new: true },
    );
    return res.json({ success: true, course: updated });
  } catch (error) {
    console.log(error.message);
    return res.json({ success: false, message: error.message });
  }
};

// DELETE /api/course/:id
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course)
      return res.json({ success: false, message: "Course not found" });
    if (course.instructor.toString() !== req.user.id)
      return res.json({ success: false, message: "Not authorized" });
    await Course.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    console.log(error.message);
    return res.json({ success: false, message: error.message });
  }
};

// PATCH /api/course/:id/publish
export const togglePublish = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course)
      return res.json({ success: false, message: "Course not found" });
    if (course.instructor.toString() !== req.user.id)
      return res.json({ success: false, message: "Not authorized" });
    course.isPublished = !course.isPublished;
    await course.save();
    return res.json({ success: true, isPublished: course.isPublished });
  } catch (error) {
    console.log(error.message);
    return res.json({ success: false, message: error.message });
  }
};

// GET /api/course/:id/student-count  (public)
export const getStudentCount = async (req, res) => {
  try {
    const count = await Enrollment.countDocuments({
      course: req.params.id,
      paymentStatus: "paid",
    });
    return res.json({ success: true, count });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
