import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance";
import "./ManageLessons.css";

const ManageLessons = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "",
    order: "",
    isFree: false,
  });
  const [videoFile, setVideoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // Track upload percentages

  useEffect(() => {
    fetchCourseAndLessons();
  }, [courseId]);

  const fetchCourseAndLessons = async () => {
    try {
      const [courseRes, lessonsRes] = await Promise.all([
        axiosInstance.get(`/course/${courseId}`),
        axiosInstance.get(`/lesson/course/${courseId}`),
      ]);
      if (courseRes.data.success) setCourse(courseRes.data.course);

      if (lessonsRes.data.success) {
        // Sort lessons chronologically by order sequence before assigning state
        const sortedLessons = lessonsRes.data.lessons.sort(
          (a, b) => Number(a.order) - Number(b.order),
        );
        setLessons(sortedLessons);
      }
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleVideoChange = (e) => {
    setVideoFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile) {
      alert("Please select a video file");
      return;
    }
    setUploading(true);
    setUploadProgress(0);

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("duration", formData.duration);
    data.append("order", formData.order);
    data.append("courseId", courseId);
    // Explicitly cast to string form matching backend string comparison
    data.append("isFree", formData.isFree ? "true" : "false");
    data.append("video", videoFile);

    try {
      const { data: resData } = await axiosInstance.post(
        "/lesson/create",
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            setUploadProgress(percentCompleted);
          },
        },
      );
      if (resData.success) {
        alert("Lesson created successfully");
        setShowForm(false);
        setFormData({
          title: "",
          description: "",
          duration: "",
          order: "",
          isFree: false,
        });
        setVideoFile(null);
        fetchCourseAndLessons(); // Trigger view updates
      } else {
        alert(resData.message);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to create lesson");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (window.confirm("Are you sure you want to delete this lesson?")) {
      try {
        const { data } = await axiosInstance.delete(`/lesson/${lessonId}`);
        if (data.success) {
          alert("Lesson deleted");
          fetchCourseAndLessons();
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error(error);
        alert("Delete failed");
      }
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!course) return <div className="error">Course not found</div>;

  return (
    <div className="manage-lessons">
      <div className="header">
        <button className="back-btn" onClick={() => navigate("/teacher")}>
          ← Back to Dashboard
        </button>
        <h1>Manage Lessons: {course.title}</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Add New Lesson"}
        </button>
      </div>

      {showForm && (
        <div className="lesson-form">
          <h2>Upload New Lesson</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g. Introduction to React Hooks"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                placeholder="Brief summary of what is covered in this lecture video"
              ></textarea>
            </div>
            <div className="form-group">
              <label>Duration (e.g., 15:30)</label>
              <input
                type="text"
                name="duration"
                placeholder="MM:SS"
                value={formData.duration}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Order (lesson number)</label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleChange}
                required
                placeholder="1"
              />
            </div>
            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="isFree"
                  checked={formData.isFree}
                  onChange={(e) =>
                    setFormData({ ...formData, isFree: e.target.checked })
                  }
                />
                Enable Free Preview Lesson for non-enrolled students
              </label>
            </div>
            <div className="form-group">
              <label>Video File *</label>
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                required
              />
            </div>

            {uploading && (
              <div className="progress-container" style={{ margin: "1rem 0" }}>
                <p>
                  Uploading payload chunk data to Cloudinary... (
                  {uploadProgress}%)
                </p>
                <div
                  style={{
                    background: "#1a1d2e",
                    width: "100%",
                    height: "8px",
                    borderRadius: "4px",
                  }}
                >
                  <div
                    style={{
                      background: "#f5a623",
                      width: `${uploadProgress}%`,
                      height: "100%",
                      borderRadius: "4px",
                      transition: "width 0.1s linear",
                    }}
                  />
                </div>
              </div>
            )}

            <button type="submit" className="btn-submit" disabled={uploading}>
              {uploading ? `Uploading ${uploadProgress}%...` : "Upload Lesson"}
            </button>
          </form>
        </div>
      )}

      <div className="lessons-list">
        <h2>Lessons ({lessons.length})</h2>
        {lessons.length === 0 ? (
          <p>No lessons yet. Click "Add New Lesson" to upload videos.</p>
        ) : (
          <div className="lessons-grid">
            {lessons.map((lesson) => (
              <div key={lesson._id} className="lesson-item">
                <div className="lesson-info">
                  <h3>
                    {lesson.order}. {lesson.title}
                  </h3>
                  <p>{lesson.description}</p>
                  <span className="duration">
                    ⏱️ {lesson.duration || "N/A"}
                  </span>
                  {lesson.isFree && (
                    <span
                      className="free-badge"
                      style={{ display: "inline-block", marginTop: "0.5rem" }}
                    >
                      Free Preview
                    </span>
                  )}
                </div>
                <div className="lesson-actions">
                  <video
                    src={lesson.videoUrl}
                    controls
                    width="240"
                    className="lesson-preview"
                    style={{ borderRadius: "6px", background: "#000" }}
                  ></video>
                  <button
                    className="btn-danger"
                    onClick={() => handleDeleteLesson(lesson._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageLessons;
