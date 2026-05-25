import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import "./VideoPlayer.css";
import axiosInstance from "../utils/axiosInstance";
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Calendar,
  Paperclip,
  Download,
} from "lucide-react";

const VideoPlayer = ({ user }) => {
  const { courseId, videoId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // tracking state
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [watchedPercent, setWatchedPercent] = useState(0);
  const [lessonMarkedDone, setLessonMarkedDone] = useState(false);
  const [courseCompleted, setCourseCompleted] = useState(false);
  const maxWatchedRef = useRef(0);

  useEffect(() => {
    fetchData();
  }, [videoId, courseId]);

  useEffect(() => {
    maxWatchedRef.current = 0;
    setWatchedPercent(0);
    setLessonMarkedDone(false);
    if (videoRef.current) videoRef.current.currentTime = 0;
  }, [videoId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [courseRes, progressRes] = await Promise.all([
        axiosInstance.get(`/course/${courseId}`),
        axiosInstance.get(`/enrollment/progress/${courseId}`),
      ]);

      if (courseRes.data.success) {
        const courseData = courseRes.data.course;
        setCourse(courseData);
        if (courseData.lessons?.length) {
          const sorted = [...courseData.lessons].sort(
            (a, b) => Number(a.order) - Number(b.order),
          );
          setLessons(sorted);
          const current = sorted.find((l) => l._id === videoId);
          setLesson(current || null);
        }
      }

      if (progressRes.data.success) {
        const done = new Set(
          progressRes.data.completedLessons.map((id) => id.toString()),
        );
        setCompletedLessons(done);
        setLessonMarkedDone(done.has(videoId));
        if (progressRes.data.isCompleted) setCourseCompleted(true);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load video. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Core watch logic ──────────────────────────────────────────────
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || lessonMarkedDone) return;

    const current = video.currentTime;
    const duration = video.duration;
    if (!duration || duration === 0) return;

    if (current <= maxWatchedRef.current + 10) {
      maxWatchedRef.current = Math.max(maxWatchedRef.current, current);
    }

    const pct = Math.round((maxWatchedRef.current / duration) * 100);
    setWatchedPercent(pct);

    if (pct >= 90 && !lessonMarkedDone) {
      markLessonComplete();
    }
  };

  const handleSeeking = () => {
    const video = videoRef.current;
    if (!video || lessonMarkedDone) return;
    if (video.currentTime > maxWatchedRef.current + 10) {
      video.currentTime = maxWatchedRef.current;
    }
  };

  const markLessonComplete = async () => {
    if (lessonMarkedDone) return;
    setLessonMarkedDone(true);
    try {
      const { data } = await axiosInstance.post(
        "/enrollment/progress/complete-lesson",
        {
          courseId,
          lessonId: videoId,
        },
      );
      if (data.success) {
        const newCompleted = new Set([...completedLessons, videoId]);
        setCompletedLessons(newCompleted);
        if (lessons.length > 0 && newCompleted.size >= lessons.length) {
          setCourseCompleted(true);
        }
      }
    } catch (err) {
      console.error("Failed to mark lesson complete", err);
      setLessonMarkedDone(false);
    }
  };

  if (loading) return <div className="vp-state">Loading video...</div>;
  if (error) return <div className="vp-state vp-state--error">{error}</div>;
  if (!lesson) return <div className="vp-state">Video not found.</div>;

  const currentIndex = lessons.findIndex((l) => l._id === videoId);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  return (
    <div className="vp-page">
      {/* ── Course completed banner ── */}
      {courseCompleted && (
        <div className="vp-completed-banner">
          <CheckCircle size={18} />
          <span>
            You've completed <strong>{course?.title}</strong>!
          </span>
          <Link to={`/certificate/${courseId}`} className="vp-cert-btn">
            <Download size={14} /> Download Certificate
          </Link>
        </div>
      )}

      {courseCompleted && <StarRating courseId={courseId} isEnrolled={true} />}

      <div className="vp-layout">
        {/* ── Main video area ── */}
        <div className="vp-main">
          <div className="vp-video-wrap">
            <video
              ref={videoRef}
              controls
              autoPlay
              width="100%"
              src={lesson.videoUrl}
              controlsList="nodownload"
              onTimeUpdate={handleTimeUpdate}
              onSeeking={handleSeeking}
            />
            {/* Watch progress bar */}
            {!lessonMarkedDone && (
              <div className="vp-watch-bar">
                <div
                  className="vp-watch-fill"
                  style={{ width: `${watchedPercent}%` }}
                />
              </div>
            )}
            {lessonMarkedDone && (
              <div className="vp-done-pill">
                <CheckCircle size={13} /> Lesson completed
              </div>
            )}
          </div>

          <div className="vp-info">
            {course && (
              <div className="vp-breadcrumb">
                <Link to={`/course/${course._id}`}>{course.title}</Link>
                <span>/</span>
                <span>Lesson {lesson.order || currentIndex + 1}</span>
              </div>
            )}

            <h1>{lesson.title}</h1>
            {lesson.description && (
              <p className="vp-desc">{lesson.description}</p>
            )}

            <div className="vp-meta">
              {lesson.duration && (
                <span>
                  <Clock size={13} /> {lesson.duration}
                </span>
              )}
              {course?.instructor && (
                <span>
                  <User size={13} />{" "}
                  {course.instructor?.name || course.instructor}
                </span>
              )}
              {lesson.createdAt && (
                <span>
                  <Calendar size={13} />{" "}
                  {new Date(lesson.createdAt).toLocaleDateString()}
                </span>
              )}
            </div>

            {lesson.resources?.length > 0 && (
              <div className="vp-resources">
                <h3>
                  <Paperclip size={14} /> Resources
                </h3>
                {lesson.resources.map((r, i) => (
                  <a
                    key={i}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="vp-resource-link"
                  >
                    📄 {r.name} <Download size={12} />
                  </a>
                ))}
              </div>
            )}

            {lesson.tags?.length > 0 && (
              <div className="vp-tags">
                {lesson.tags.map((tag, i) => (
                  <span key={i} className="vp-tag">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Sidebar ── */}
        <aside className="vp-sidebar">
          <div className="vp-sidebar-header">
            <h3>Course content</h3>
            <span>{lessons.length} lessons</span>
          </div>

          <div className="vp-lessons">
            {lessons.map((les, index) => {
              const isDone = completedLessons.has(les._id.toString());
              const isActive = les._id === videoId;
              return (
                <Link
                  key={les._id}
                  to={`/video/${courseId}/${les._id}`}
                  className={`vp-lesson-item ${isActive ? "vp-lesson-item--active" : ""} ${isDone ? "vp-lesson-item--done" : ""}`}
                >
                  <div className="vp-lesson-num">
                    {isDone ? (
                      <CheckCircle size={14} color="#16a34a" />
                    ) : (
                      <span>{les.order || index + 1}</span>
                    )}
                  </div>
                  <div className="vp-lesson-text">
                    <h4>{les.title}</h4>
                    {les.duration && <p>{les.duration}</p>}
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="vp-nav-btns">
            {prevLesson && (
              <Link
                to={`/video/${courseId}/${prevLesson._id}`}
                className="vp-nav-btn vp-nav-btn--outline"
              >
                <ChevronLeft size={15} /> Previous
              </Link>
            )}
            {nextLesson && (
              <Link
                to={`/video/${courseId}/${nextLesson._id}`}
                className="vp-nav-btn vp-nav-btn--primary"
              >
                Next <ChevronRight size={15} />
              </Link>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default VideoPlayer;
