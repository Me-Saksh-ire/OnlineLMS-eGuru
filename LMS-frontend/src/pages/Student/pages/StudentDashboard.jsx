import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./StudentDashboard.css";
import axiosInstance from "../../../utils/axiosInstance";
import {
  BookOpen,
  CheckCircle,
  Award,
  GraduationCap,
  PlayCircle,
  TrendingUp,
} from "lucide-react";

const StudentDashboard = ({ user }) => {
  const [enrollments, setEnrollments] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchDashboard();
  }, [user]);

  const fetchDashboard = async () => {
    try {
      const { data } = await axiosInstance.get("/enrollment/my");
      if (!data.success) return;
      setEnrollments(data.enrollments);
      const progressResults = await Promise.all(
        data.enrollments.map((e) =>
          axiosInstance
            .get(`/enrollment/progress/${e.course._id}`)
            .then((r) => ({ courseId: e.course._id, ...r.data }))
            .catch(() => ({
              courseId: e.course._id,
              percentage: 0,
              completedCount: 0,
              totalLessons: 0,
            })),
        ),
      );
      const map = {};
      progressResults.forEach((p) => {
        map[p.courseId] = p;
      });
      setProgressMap(map);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalCompleted = Object.values(progressMap).reduce(
    (acc, p) => acc + (p.completedCount || 0),
    0,
  );
  const completedCourses = Object.values(progressMap).filter(
    (p) => p.isCompleted,
  ).length;
  const avgProgress =
    Object.values(progressMap).length > 0
      ? Math.round(
          Object.values(progressMap).reduce(
            (acc, p) => acc + (p.percentage || 0),
            0,
          ) / Object.values(progressMap).length,
        )
      : 0;

  const stats = [
    {
      label: "Enrolled courses",
      value: enrollments.length,
      icon: BookOpen,
      color: "#d97706",
      bg: "#fef3c7",
    },
    {
      label: "Completed lessons",
      value: totalCompleted,
      icon: CheckCircle,
      color: "#16a34a",
      bg: "#dcfce7",
    },
    {
      label: "Avg progress",
      value: `${avgProgress}%`,
      icon: TrendingUp,
      color: "#f5a623",
      bg: "#fff7ed",
    },
    {
      label: "Completed courses",
      value: completedCourses,
      icon: GraduationCap,
      color: "#7c3aed",
      bg: "#ede9fe",
    },
  ];

  if (loading) return <div className="sd-loading">Loading dashboard...</div>;

  return (
    <div className="student-dashboard">
      <div className="sd-header">
        <h1>Welcome back, {user?.name}! 👋</h1>
        <p>Continue your learning journey</p>
      </div>

      <div className="sd-content">
        {/* Stats */}
        <div className="sd-stats">
          {stats.map((s) => (
            <div className="sd-stat-card" key={s.label}>
              <div
                className="sd-stat-icon"
                style={{ background: s.bg, color: s.color }}
              >
                <s.icon size={18} />
              </div>
              <div>
                <div className="sd-stat-num">{s.value}</div>
                <div className="sd-stat-lbl">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* My Courses */}
        <div className="sd-card">
          <div className="sd-card-header">
            <h2>My courses</h2>
            <Link to="/courses" className="sd-link-btn">
              Explore more
            </Link>
          </div>

          {enrollments.length === 0 ? (
            <div className="sd-empty">
              <BookOpen size={40} color="#94a3b8" />
              <h3>No courses yet</h3>
              <p>Start learning by enrolling in a course</p>
              <Link to="/courses" className="sd-primary-btn">
                Browse courses
              </Link>
            </div>
          ) : (
            enrollments.map((enrollment) => {
              const course = enrollment.course;
              const progress = progressMap[course._id] || {};
              const pct = progress.percentage || 0;
              const instructorName =
                typeof course.instructor === "object"
                  ? course.instructor?.name
                  : course.instructor || "EGuru Instructor";

              return (
                <div key={enrollment._id} className="sd-course-row">
                  <img
                    src={
                      course.thumbnail || "https://via.placeholder.com/80x52"
                    }
                    alt={course.title}
                    className="sd-thumb"
                  />
                  <div className="sd-course-info">
                    <h3>{course.title}</h3>
                    <p className="sd-instructor">{instructorName}</p>
                    <div className="sd-progress-row">
                      <div className="sd-pbar">
                        <div
                          className="sd-pfill"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="sd-pct">{pct}%</span>
                    </div>
                    <p className="sd-lessons-info">
                      {progress.completedCount || 0} of{" "}
                      {progress.totalLessons || course.totalLessons || 0}{" "}
                      lessons
                    </p>
                    {progress.isCompleted && (
                      <span className="sd-completed-badge">
                        <CheckCircle size={11} /> Course completed!
                      </span>
                    )}
                  </div>
                  <Link
                    to={`/course/${course._id}`}
                    className={`sd-resume-btn ${progress.isCompleted ? "sd-resume-btn--done" : ""}`}
                  >
                    <PlayCircle size={13} />
                    {pct > 0 ? "Resume" : "Start"}
                  </Link>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
