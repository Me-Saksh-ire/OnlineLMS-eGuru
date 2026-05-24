import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import "./MyCourses.css";
import {
  Award,
  CheckCircle,
  PlayCircle,
  BookOpen,
  Clock,
  User,
} from "lucide-react";

const CoursePlaceholder = ({ title }) => {
  const colors = [
    "linear-gradient(135deg,#1a2744,#0f6e56)",
    "linear-gradient(135deg,#1a1a2e,#534ab7)",
    "linear-gradient(135deg,#2d1b00,#ba7517)",
    "linear-gradient(135deg,#1a0a0a,#993c1d)",
  ];
  const idx = (title?.charCodeAt(0) ?? 0) % colors.length;
  return (
    <div className="mc-thumb-placeholder" style={{ background: colors[idx] }}>
      <span>
        <BookOpen size={24} color="#fff" />
      </span>
    </div>
  );
};

const MyCourses = () => {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");
  const [progressMap, setProgressMap] = useState({});
  const [firstLessonMap, setFirstLessonMap] = useState({});

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const { data } = await axiosInstance.get("/enrollment/my");
        if (data.success) {
          const enrollments = data.enrollments || [];
          setCourses(enrollments);

          const progressResults = await Promise.all(
            enrollments.map((e) =>
              axiosInstance
                .get(`/enrollment/progress/${e.course._id}`)
                .then((r) => [e.course._id, r.data])
                .catch(() => [
                  e.course._id,
                  {
                    percentage: 0,
                    completedCount: 0,
                    totalLessons: 0,
                    isCompleted: false,
                  },
                ]),
            ),
          );
          setProgressMap(Object.fromEntries(progressResults));

          // Fetch first lesson id for each course so video links work
          const lessonsResults = await Promise.all(
            enrollments.map((e) =>
              axiosInstance
                .get(`/lesson/course/${e.course._id}`)
                .then((r) => [
                  e.course._id,
                  r.data?.lessons && r.data.lessons.length > 0
                    ? r.data.lessons[0]._id
                    : null,
                ])
                .catch(() => [e.course._id, null]),
            ),
          );
          setFirstLessonMap(Object.fromEntries(lessonsResults));
        } else {
          toast.error(data.message || "Unable to load your courses.");
        }
      } catch (err) {
        toast.error(
          err.response?.data?.message ||
            err.message ||
            "Unable to load your courses.",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchMyCourses();
  }, []);

  if (loading) {
    return (
      <div className="mc-status">
        <div className="mc-spinner" />
        Loading your courses…
      </div>
    );
  }

  if (error) {
    return <div className="mc-status mc-status--error">⚠️ {error}</div>;
  }

  const instructorName = (instructor) =>
    typeof instructor === "object"
      ? instructor?.name
      : instructor || "EGuru Instructor";

  return (
    <div className="mc-page">
      <div className="mc-header">
        <div>
          <h1 className="mc-title">My Courses</h1>
          {courses.length > 0 && (
            <p className="mc-subtitle">
              You're enrolled in {courses.length} course
              {courses.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="mc-empty">
          <div className="mc-empty-icon">
            <BookOpen size={48} color="#94a3b8" />
          </div>
          <h3>No courses yet</h3>
          <p>Start learning by enrolling in a course</p>
          <Link to="/courses" className="mc-browse-btn">
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="mc-grid">
          {courses.map((enrollment) => {
            const course = enrollment.course || {};
            const prog = progressMap[course._id] || {};
            const pct = prog.percentage ?? 0;
            const completed = prog.completedCount ?? 0;
            const total =
              prog.totalLessons ??
              course.lessons?.length ??
              course.totalLessons ??
              0;
            const isDone = prog.isCompleted;
            const category = course.category || course.level || "Course";

            return (
              <div key={course._id || enrollment._id} className="mc-card">
                {/* Thumbnail */}
                <div className="mc-thumb-wrap">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="mc-thumb"
                    />
                  ) : (
                    <CoursePlaceholder title={course.title} />
                  )}
                  {isDone && (
                    <div className="mc-done-overlay">
                      <span className="mc-done-check">
                        <CheckCircle size={24} />
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="mc-card-body">
                  <div className="mc-card-top">
                    <div className="mc-tags">
                      <span className="mc-tag">{category}</span>
                      {isDone && (
                        <span className="mc-tag mc-tag--done">Completed</span>
                      )}
                    </div>
                  </div>

                  <h2 className="mc-card-title">
                    {course.title || "Untitled Course"}
                  </h2>
                  <p className="mc-card-instructor">
                    by {instructorName(course.instructor)}
                  </p>

                  <div className="mc-progress-section">
                    <div className="mc-progress-label">
                      <span>Progress</span>
                      <span className="mc-pct">{pct}%</span>
                    </div>
                    <div className="mc-pbar">
                      <div className="mc-pfill" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="mc-lectures">
                      <Clock size={14} /> {completed}/{total} lectures completed
                    </p>
                  </div>

                  <div className="mc-card-actions">
                    {isDone ? (
                      <>
                        <Link
                          to={`/certificate/${course._id}`}
                          className="mc-btn mc-btn--primary"
                        >
                          <Award size={16} /> View Certificate
                        </Link>
                        <Link
                          to={`/video/${course._id}/${
                            firstLessonMap[course._id] ||
                            course.lessons?.[0]?._id
                          }`}
                          className="mc-btn mc-btn--icon"
                          title="Revisit course"
                        >
                          <PlayCircle size={16} />
                        </Link>
                      </>
                    ) : (
                      <Link
                        to={`/course/${course._id}`}
                        className="mc-btn mc-btn--primary"
                      >
                        <PlayCircle size={16} />{" "}
                        {pct > 0 ? "Continue" : "Start"}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyCourses;
