import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./TeacherDashboard.css";
import axiosInstance from "../../../utils/axiosInstance";
import { useAppContext } from "../../../context/AppContext";
import {
  BookOpen,
  Users,
  Star,
  IndianRupee,
  Plus,
  Eye,
  Settings,
  PenLine,
  Globe,
  EyeOff,
  X,
  ChevronRight,
  TrendingUp,
  CheckCircle,
  Clock,
} from "lucide-react";

const TeacherDashboard = () => {
  const { user } = useAppContext();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCoursePicker, setShowCoursePicker] = useState(false);

  const [stats, setStats] = useState({
    totalStudents: 0,
    avgRating: 0,
    totalEarnings: 0,
    totalCourses: 0,
  });

  const [courseStats, setCourseStats] = useState({});
  const [expandedCourse, setExpandedCourse] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      await Promise.all([fetchInstructorCourses(), fetchEarningsStats()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchInstructorCourses = async () => {
    try {
      const { data } = await axiosInstance.get("/course/instructor/my-courses");
      if (data.success) {
        setCourses(data.courses);
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  const fetchEarningsStats = async () => {
    try {
      const { data } = await axiosInstance.get("/enrollment/instructor/stats");
      if (!data.success) return;

      setStats({
        totalStudents: data.totalStudents || 0,
        avgRating: data.avgRating || 0,
        totalEarnings: data.totalEarnings || 0,
      });

      // Build a map keyed by courseId for easy lookup
      const map = {};
      (data.courseStats || []).forEach((cs) => {
        map[cs.courseId] = cs;
      });
      setCourseStats(map);
    } catch (err) {
      console.error("Error fetching instructor stats:", err);

      setCourses((prev) => {
        let totalStudents = 0,
          totalEarnings = 0,
          totalRating = 0;
        prev.forEach((c) => {
          totalStudents += c.totalStudents || 0;
          totalEarnings += (c.totalStudents || 0) * (c.price || 0);
          totalRating += c.rating || 0;
        });
        setStats({
          totalStudents,
          totalEarnings,
          avgRating: prev.length ? (totalRating / prev.length).toFixed(1) : 0,
        });
        return prev;
      });
    }
  };

  // ── Toggle publish ─────────────────────────────────────────────────────────
  const handleTogglePublish = async (courseId) => {
    try {
      const { data } = await axiosInstance.patch(`/course/${courseId}/publish`);
      if (data.success) {
        setCourses((prev) =>
          prev.map((c) =>
            c._id === courseId ? { ...c, isPublished: data.isPublished } : c,
          ),
        );
      } else {
        alert(data.message || "Failed to update publish status");
      }
    } catch {
      alert("Something went wrong");
    }
  };

  // ── Manage lessons picker ──────────────────────────────────────────────────
  const handleManageLessonsClick = () => {
    if (courses.length === 0) {
      alert("You have no courses yet. Create a course first.");
      return;
    }
    if (courses.length === 1) {
      navigate(`/teacher/course/${courses[0]._id}/lessons`);
      return;
    }
    setShowCoursePicker(true);
  };

  // ── Stat cards ─────────────────────────────────────────────────────────────
  const statCards = [
    {
      label: "Total Courses",
      value: courses.length,
      icon: BookOpen,
      color: "blue",
    },
    {
      label: "Total Students",
      value: stats.totalStudents.toLocaleString("en-IN"),
      icon: Users,
      color: "green",
    },
    {
      label: "Avg Rating",
      value: stats.avgRating || "—",
      icon: Star,
      color: "amber",
    },
    {
      label: "Total Revenue",
      // This is now REAL revenue from payment records, not an estimate
      value: `₹${stats.totalEarnings.toLocaleString("en-IN")}`,
      icon: IndianRupee,
      color: "purple",
    },
  ];

  return (
    <div className="td-page">
      {/* ── Course Picker Modal ── */}
      {showCoursePicker && (
        <div className="td-overlay" onClick={() => setShowCoursePicker(false)}>
          <div className="td-modal" onClick={(e) => e.stopPropagation()}>
            <div className="td-modal-header">
              <h3>Select a Course</h3>
              <button
                className="td-modal-close"
                onClick={() => setShowCoursePicker(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="td-modal-list">
              {courses.map((course) => (
                <button
                  key={course._id}
                  className="td-modal-item"
                  onClick={() => {
                    setShowCoursePicker(false);
                    navigate(`/teacher/course/${course._id}/lessons`);
                  }}
                >
                  {course.thumbnail && (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="td-modal-thumb"
                    />
                  )}
                  <div className="td-modal-item-info">
                    <p className="td-modal-item-title">{course.title}</p>
                    <p className="td-modal-item-meta">
                      <BookOpen size={12} /> {course.lessons?.length || 0}{" "}
                      lessons
                    </p>
                  </div>
                  <ChevronRight size={16} className="td-modal-arrow" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="td-header">
        <div className="td-header-inner">
          <div className="td-header-left">
            <div>
              <h1 className="td-header-name">Instructor Dashboard</h1>
              <p className="td-header-greeting">
                Manage your courses, track real earnings, and create content
              </p>
            </div>
          </div>
          <button
            className="td-create-btn"
            onClick={() => navigate("/create-course")}
          >
            <Plus size={16} /> New Course
          </button>
        </div>
      </div>

      <div className="td-body">
        {/* ── Stats ── */}
        <div className="td-stats">
          {statCards.map((s) => (
            <div key={s.label} className={`td-stat td-stat--${s.color}`}>
              <div className="td-stat-icon">
                <s.icon size={20} />
              </div>
              <div className="td-stat-info">
                <span className="td-stat-value">{s.value}</span>
                <span className="td-stat-label">{s.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Courses Section ── */}
        <div className="td-section">
          <div className="td-section-header">
            <div>
              <h2 className="td-section-title">My Courses</h2>
              <p className="td-section-sub">
                {courses.length} course{courses.length !== 1 ? "s" : ""} created
              </p>
            </div>
            <div className="td-section-actions">
              <button
                className="td-outline-btn"
                onClick={handleManageLessonsClick}
              >
                <Settings size={14} /> Manage Lessons
              </button>
              <button
                className="td-primary-btn"
                onClick={() => navigate("/create-course")}
              >
                <Plus size={14} /> Create Course
              </button>
            </div>
          </div>

          {loading ? (
            <div className="td-loading">
              <div className="td-spinner" />
              Loading courses...
            </div>
          ) : courses.length === 0 ? (
            <div className="td-empty">
              <div className="td-empty-icon">
                <BookOpen size={40} strokeWidth={1.5} />
              </div>
              <h3>No courses yet</h3>
              <p>Start creating your first course to reach students</p>
              <button
                className="td-primary-btn"
                onClick={() => navigate("/create-course")}
              >
                <Plus size={15} /> Create First Course
              </button>
            </div>
          ) : (
            <div className="td-courses-grid">
              {courses.map((course) => {
                const cs = courseStats[course._id] || {};
                const isExpanded = expandedCourse === course._id;

                return (
                  <div key={course._id} className="td-course-card">
                    {/* Thumbnail */}
                    <div className="td-course-thumb">
                      <img
                        src={
                          course.thumbnail ||
                          "https://via.placeholder.com/300x180"
                        }
                        alt={course.title}
                      />
                      <span
                        className={`td-badge ${course.isPublished ? "td-badge--live" : "td-badge--draft"}`}
                      >
                        {course.isPublished ? (
                          <>
                            <Globe size={10} /> Live
                          </>
                        ) : (
                          <>
                            <EyeOff size={10} /> Draft
                          </>
                        )}
                      </span>
                      {course.price > 0 && (
                        <span className="td-price-tag">
                          ₹
                          {course.discountPrice?.toLocaleString("en-IN") ||
                            course.price?.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="td-course-body">
                      <h3 className="td-course-title">{course.title}</h3>

                      <div className="td-course-meta">
                        <span>
                          <Users size={13} />{" "}
                          {cs.enrolledCount ?? course.totalStudents ?? 0}{" "}
                          students
                        </span>
                        <span>
                          <Star size={13} /> {course.rating || "—"}
                        </span>
                        <span>
                          <BookOpen size={13} /> {course.lessons?.length || 0}{" "}
                          lessons
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="td-course-actions">
                        <Link
                          to={`/course/${course._id}`}
                          className="td-action-btn"
                        >
                          <Eye size={13} /> View
                        </Link>
                        <button
                          className="td-action-btn"
                          onClick={() =>
                            navigate(`/teacher/course/${course._id}/lessons`)
                          }
                        >
                          <Settings size={13} /> Lessons
                        </button>
                        <button
                          className="td-action-btn"
                          onClick={() => navigate(`/edit-course/${course._id}`)}
                        >
                          <PenLine size={13} /> Edit
                        </button>
                        <button
                          className={`td-action-btn ${course.isPublished ? "td-action-btn--danger" : "td-action-btn--success"}`}
                          onClick={() => handleTogglePublish(course._id)}
                        >
                          {course.isPublished ? (
                            <>
                              <EyeOff size={13} /> Unpublish
                            </>
                          ) : (
                            <>
                              <Globe size={13} /> Publish
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
