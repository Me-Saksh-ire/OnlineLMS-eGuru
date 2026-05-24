import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../../utils/axiosInstance";
import { toast } from "react-hot-toast";

const UploadLesson = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [form, setForm] = useState({
    courseId: "",
    title: "",
    description: "",
    order: "",
    duration: "",
    isFree: "false",
  });

  // Fetch instructor's courses for the dropdown
  useEffect(() => {
    const fetchCourses = async () => {
      const { data } = await axiosInstance.get("/course/instructor/my-courses");
      if (data.success) setCourses(data.courses);
    };
    fetchCourses();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleVideo = (e) => setVideoFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile) return alert("Please select a video file");
    setLoading(true);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => formData.append(key, val));
      formData.append("video", videoFile);

      const { data } = await axiosInstance.post("/lesson/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          const pct = Math.round((e.loaded * 100) / e.total);
          setUploadProgress(pct);
        },
      });

      if (data.success) {
        toast.success("Lesson uploaded successfully!");
        navigate("/teacher");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error.message);
      toast.error("Something went wrong");
    }
    setLoading(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

        .upload-page {
          min-height: 100vh;
          background: #0d0f1a;
          font-family: 'DM Sans', sans-serif;
          padding: 2rem;
        }

        .upload-header {
          max-width: 680px;
          margin: 0 auto 2rem;
        }

        .upload-header h1 {
          font-family: 'Sora', sans-serif;
          font-size: 1.8rem;
          font-weight: 800;
          color: #fff;
        }

        .upload-header p { color: #6b7280; font-size: 0.9rem; margin-top: 0.3rem; }

        .upload-form {
          max-width: 680px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-card {
          background: #111320;
          border: 1px solid #1e2130;
          border-radius: 14px;
          padding: 1.5rem;
        }

        .form-card h3 {
          font-family: 'Sora', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          color: #f5a623;
          margin-bottom: 1.25rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #1e2130;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          margin-bottom: 1rem;
        }

        .field:last-child { margin-bottom: 0; }

        .field label {
          font-size: 0.82rem;
          font-weight: 600;
          color: #e5e7eb;
        }

        .field input,
        .field textarea,
        .field select {
          background: #1a1d2e;
          border: 1.5px solid #2a2d3e;
          border-radius: 9px;
          padding: 0.75rem 1rem;
          font-size: 0.9rem;
          color: #e5e7eb;
          font-family: 'DM Sans', sans-serif;
          transition: border-color 0.2s;
          width: 100%;
          box-sizing: border-box;
        }

        .field input::placeholder,
        .field textarea::placeholder { color: #4b5563; }

        .field input:focus,
        .field textarea:focus,
        .field select:focus {
          outline: none;
          border-color: #f5a623;
        }

        .field select option { background: #1a1d2e; }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        /* Video upload */
        .video-upload {
          border: 2px dashed #2a2d3e;
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: border-color 0.2s;
          position: relative;
        }

        .video-upload:hover { border-color: #f5a623; }

        .video-upload input {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
          width: 100%;
          height: 100%;
        }

        .video-placeholder span { font-size: 2.5rem; display: block; margin-bottom: 0.5rem; }
        .video-placeholder p { color: #9ca3af; font-size: 0.875rem; }
        .video-placeholder small { color: #4b5563; font-size: 0.78rem; }

        .video-selected {
          background: rgba(245,166,35,0.05);
          border-color: #f5a623;
        }

        .video-selected-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          justify-content: center;
        }

        .video-selected-info span { font-size: 1.5rem; }
        .video-selected-info p { color: #e5e7eb; font-size: 0.875rem; font-weight: 500; }
        .video-selected-info small { color: #6b7280; font-size: 0.78rem; }

        /* Progress bar */
        .progress-wrap {
          margin-top: 1rem;
        }

        .progress-label {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          color: #9ca3af;
          margin-bottom: 0.4rem;
        }

        .progress-bar {
          width: 100%;
          height: 6px;
          background: #1e2130;
          border-radius: 99px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #f5a623, #e09516);
          border-radius: 99px;
          transition: width 0.3s ease;
        }

        /* Submit */
        .submit-row {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        .btn-cancel {
          background: #1a1d2e;
          border: 1px solid #2a2d3e;
          color: #9ca3af;
          border-radius: 9px;
          padding: 0.75rem 1.5rem;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.2s;
        }

        .btn-cancel:hover { background: #2a2d3e; }

        .btn-submit {
          background: #f5a623;
          border: none;
          color: #0d0f1a;
          border-radius: 9px;
          padding: 0.75rem 2rem;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          font-family: 'Sora', sans-serif;
          transition: background 0.2s;
        }

        .btn-submit:hover { background: #e09516; }
        .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        @media (max-width: 640px) {
          .form-row { grid-template-columns: 1fr; }
          .upload-page { padding: 1rem; }
        }
      `}</style>

      <div className="upload-page">
        <div className="upload-header">
          <h1>Upload Lesson</h1>
          <p>Add a new video lesson to one of your courses</p>
        </div>

        <form className="upload-form" onSubmit={handleSubmit}>
          {/* Course & Lesson Info */}
          <div className="form-card">
            <h3>📋 Lesson Details</h3>

            <div className="field">
              <label>Select Course *</label>
              <select
                name="courseId"
                value={form.courseId}
                onChange={handleChange}
                required
              >
                <option value="">-- Choose a course --</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Lesson Title *</label>
              <input
                name="title"
                placeholder="e.g. Introduction to React Hooks"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label>Description</label>
              <textarea
                name="description"
                placeholder="Brief description of what this lesson covers"
                value={form.description}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <div className="field">
                <label>Lesson Order *</label>
                <input
                  name="order"
                  type="number"
                  placeholder="1"
                  min="1"
                  value={form.order}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="field">
                <label>Duration</label>
                <input
                  name="duration"
                  placeholder="e.g. 15:30"
                  value={form.duration}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="field">
              <label>Free Preview?</label>
              <select name="isFree" value={form.isFree} onChange={handleChange}>
                <option value="false">No — enrolled students only</option>
                <option value="true">Yes — visible to everyone</option>
              </select>
            </div>
          </div>

          {/* Video Upload */}
          <div className="form-card">
            <h3>🎥 Video File</h3>
            <div
              className={`video-upload ${videoFile ? "video-selected" : ""}`}
            >
              <input type="file" accept="video/*" onChange={handleVideo} />
              {videoFile ? (
                <div className="video-selected-info">
                  <span>🎬</span>
                  <div>
                    <p>{videoFile.name}</p>
                    <small>
                      {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
                    </small>
                  </div>
                </div>
              ) : (
                <div className="video-placeholder">
                  <span>🎥</span>
                  <p>Click to upload video</p>
                  <small>MP4, MOV, AVI, MKV supported</small>
                </div>
              )}
            </div>

            {loading && uploadProgress > 0 && (
              <div className="progress-wrap">
                <div className="progress-label">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="submit-row">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate("/teacher")}
            >
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? `Uploading ${uploadProgress}%...` : "Upload Lesson"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default UploadLesson;
