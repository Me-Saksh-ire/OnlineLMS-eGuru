import React, { useState } from "react";
import "./CreateCourse.css";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance";

const CATEGORIES = [
  "Development",
  "Design",
  "Data Science",
  "Business",
  "Marketing",
  "Digital Arts",
];
const LEVELS = ["Beginner", "Intermediate", "Advanced", "Beginner to Advanced"];

const CreateCourse = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    discountPrice: "",
    category: "Development",
    level: "Beginner",
    language: "English",
  });

  // Dynamic array fields
  const [syllabus, setSyllabus] = useState([""]);
  const [requirements, setRequirements] = useState([""]);
  const [whatYouWillLearn, setWhatYouWillLearn] = useState([""]);
  const [thumbnail, setThumbnail] = useState(null);

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

      // Basic fields
      Object.entries(form).forEach(([key, val]) => formData.append(key, val));

      // Arrays as JSON strings
      // ✅ Replace those 3 lines with this:
      whatYouWillLearn
        .filter(Boolean)
        .forEach((item) => formData.append("whatYouWillLearn[]", item));
      syllabus
        .filter(Boolean)
        .forEach((item) => formData.append("syllabus[]", item));
      requirements
        .filter(Boolean)
        .forEach((item) => formData.append("requirements[]", item));

      // Thumbnail file
      if (thumbnail) formData.append("thumbnail", thumbnail);

      const { data } = await axiosInstance.post("/course/create", formData);

      if (data.success) {
        alert("Course created successfully!");
        navigate("/teacher");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error.message);
      alert("Something went wrong");
    }
    setLoading(false);
  };

  return (
    <>
      <div className="create-page">
        <div className="create-header">
          <h1>Create New Course</h1>
          <p>Fill in the details below to publish your course</p>
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
                    updateArray(
                      requirements,
                      setRequirements,
                      i,
                      e.target.value,
                    )
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
              {loading ? "Creating..." : "Create Course"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreateCourse;
