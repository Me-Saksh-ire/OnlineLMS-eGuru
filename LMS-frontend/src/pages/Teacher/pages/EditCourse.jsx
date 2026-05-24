import React, { useState, useEffect } from "react";
import "./CreateCourse.css"; // reuse same styles
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance";

const CATEGORIES = [
  "Development",
  "Design",
  "Data Science",
  "Business",
  "Marketing",
];
const LEVELS = ["Beginner", "Intermediate", "Advanced", "Beginner to Advanced"];

const EditCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [thumbnail, setThumbnail] = useState(null); // new file (if replacing)

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    discountPrice: "",
    category: "Development",
    level: "Beginner",
    language: "English",
  });

  const [syllabus, setSyllabus] = useState([""]);
  const [requirements, setRequirements] = useState([""]);
  const [whatYouWillLearn, setWhatYouWillLearn] = useState([""]);

  // Load existing course data
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const { data } = await axiosInstance.get(`/course/${courseId}`);
        if (data.success) {
          const c = data.course;
          setForm({
            title: c.title || "",
            description: c.description || "",
            price: c.price || "",
            discountPrice: c.discountPrice || "",
            category: c.category || "Development",
            level: c.level || "Beginner",
            language: c.language || "English",
          });
          setSyllabus(c.syllabus?.length ? c.syllabus : [""]);
          setRequirements(c.requirements?.length ? c.requirements : [""]);
          setWhatYouWillLearn(
            c.whatYouWillLearn?.length ? c.whatYouWillLearn : [""],
          );
          if (c.thumbnail) setThumbnailPreview(c.thumbnail);
        } else {
          alert("Course not found");
          navigate("/teacher");
        }
      } catch (err) {
        console.error(err);
        alert("Failed to load course");
        navigate("/teacher");
      } finally {
        setFetching(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleThumbnail = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const updateArray = (arr, setArr, index, value) => {
    const updated = [...arr];
    updated[index] = value;
    setArr(updated);
  };
  const addItem = (arr, setArr) => setArr([...arr, ""]);
  const removeItem = (arr, setArr, index) =>
    setArr(arr.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => formData.append(key, val));
      formData.append("syllabus", JSON.stringify(syllabus.filter(Boolean)));
      formData.append(
        "requirements",
        JSON.stringify(requirements.filter(Boolean)),
      );
      formData.append(
        "whatYouWillLearn",
        JSON.stringify(whatYouWillLearn.filter(Boolean)),
      );
      if (thumbnail) formData.append("thumbnail", thumbnail);

      const { data } = await axiosInstance.put(`/course/${courseId}`, formData);

      if (data.success) {
        alert("Course updated successfully!");
        navigate("/teacher");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error.message);
      alert("Something went wrong");
    }
    setLoading(false);
  };

  if (fetching)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0d0f1a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#e5e7eb",
          fontFamily: "DM Sans, sans-serif",
        }}
      >
        Loading course...
      </div>
    );

  return (
    <div className="create-page">
      <div className="create-header">
        <h1>Edit Course</h1>
        <p>Update your course details below</p>
      </div>

      <form className="create-form" onSubmit={handleSubmit}>
        {/* Basic Info */}
        <div className="form-card">
          <h3>📋 Basic Information</h3>

          <div className="field">
            <label>Course Title *</label>
            <input
              name="title"
              placeholder="e.g. Complete React Developer Course"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label>Description *</label>
            <textarea
              name="description"
              placeholder="What will students learn in this course?"
              value={form.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="field">
              <label>Category *</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Level</label>
              <select name="level" value={form.level} onChange={handleChange}>
                {LEVELS.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="field">
              <label>Price (₹) *</label>
              <input
                name="price"
                type="number"
                placeholder="999"
                value={form.price}
                onChange={handleChange}
                required
              />
            </div>
            <div className="field">
              <label>Discount Price (₹)</label>
              <input
                name="discountPrice"
                type="number"
                placeholder="499"
                value={form.discountPrice}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="field">
            <label>Language</label>
            <input
              name="language"
              placeholder="English"
              value={form.language}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Thumbnail */}
        <div className="form-card">
          <h3>🖼️ Course Thumbnail</h3>
          <div className="thumbnail-upload">
            <input type="file" accept="image/*" onChange={handleThumbnail} />
            {thumbnailPreview ? (
              <>
                <img
                  src={thumbnailPreview}
                  className="thumbnail-preview"
                  alt="preview"
                />
                <p style={{ color: "#6b7280", fontSize: "0.8rem" }}>
                  Click to change
                </p>
              </>
            ) : (
              <div className="thumbnail-placeholder">
                <span>🖼️</span>
                <p>Click to upload thumbnail</p>
                <p style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>
                  JPG, PNG, WEBP — recommended 800×450
                </p>
              </div>
            )}
          </div>
        </div>

        {/* What You'll Learn */}
        <div className="form-card">
          <h3>✅ What Students Will Learn</h3>
          {whatYouWillLearn.map((item, i) => (
            <div className="array-item" key={i}>
              <input
                placeholder={`Learning outcome ${i + 1}`}
                value={item}
                onChange={(e) =>
                  updateArray(
                    whatYouWillLearn,
                    setWhatYouWillLearn,
                    i,
                    e.target.value,
                  )
                }
              />
              {whatYouWillLearn.length > 1 && (
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() =>
                    removeItem(whatYouWillLearn, setWhatYouWillLearn, i)
                  }
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="add-btn"
            onClick={() => addItem(whatYouWillLearn, setWhatYouWillLearn)}
          >
            + Add outcome
          </button>
        </div>

        {/* Syllabus */}
        <div className="form-card">
          <h3>📚 Syllabus</h3>
          {syllabus.map((item, i) => (
            <div className="array-item" key={i}>
              <input
                placeholder={`Section ${i + 1} title`}
                value={item}
                onChange={(e) =>
                  updateArray(syllabus, setSyllabus, i, e.target.value)
                }
              />
              {syllabus.length > 1 && (
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => removeItem(syllabus, setSyllabus, i)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="add-btn"
            onClick={() => addItem(syllabus, setSyllabus)}
          >
            + Add section
          </button>
        </div>

        {/* Requirements */}
        <div className="form-card">
          <h3>📌 Requirements</h3>
          {requirements.map((item, i) => (
            <div className="array-item" key={i}>
              <input
                placeholder={`Requirement ${i + 1}`}
                value={item}
                onChange={(e) =>
                  updateArray(requirements, setRequirements, i, e.target.value)
                }
              />
              {requirements.length > 1 && (
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => removeItem(requirements, setRequirements, i)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="add-btn"
            onClick={() => addItem(requirements, setRequirements)}
          >
            + Add requirement
          </button>
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
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCourse;
