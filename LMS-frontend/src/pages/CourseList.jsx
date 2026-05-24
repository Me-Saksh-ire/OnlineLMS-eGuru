import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "./CourseList.css";
import axiosInstance from "../utils/axiosInstance";

const CATEGORIES = [
  "All",
  "Development",
  "Design",
  "Data Science",
  "Business",
  "Marketing",
  "Digital Arts",
];

const CourseList = () => {
  const [searchParams] = useSearchParams();
  const [allCourses, setAllCourses] = useState([]); // raw API data
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("popular");
  const [showFilters, setShowFilters] = useState(false);

  // Pick up ?category= from URL
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  // Fetch all published courses once
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data } = await axiosInstance.get("/course/all?limit=100");
        if (data.success) setAllCourses(data.courses);
      } catch (err) {
        console.error("Failed to fetch courses", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Filter + sort whenever deps change
  useEffect(() => {
    let results = [...allCourses];

    // Category filter
    if (selectedCategory && selectedCategory !== "All") {
      results = results.filter(
        (c) => c.category?.toLowerCase() === selectedCategory.toLowerCase(),
      );
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (c) =>
          c.title?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q),
      );
    }

    // Sort
    if (sortBy === "popular") {
      results.sort((a, b) => (b.totalStudents || 0) - (a.totalStudents || 0));
    } else if (sortBy === "rating") {
      results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === "price-low") {
      results.sort(
        (a, b) =>
          (a.discountPrice || a.price || 0) - (b.discountPrice || b.price || 0),
      );
    } else if (sortBy === "price-high") {
      results.sort(
        (a, b) =>
          (b.discountPrice || b.price || 0) - (a.discountPrice || a.price || 0),
      );
    } else if (sortBy === "newest") {
      results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredCourses(results);
  }, [allCourses, searchQuery, selectedCategory, sortBy]);

  const instructorName = (course) => {
    if (!course.instructor) return "EGuru Instructor";
    if (typeof course.instructor === "object")
      return course.instructor.name || "EGuru Instructor";
    return course.instructor;
  };

  const instructorAvatar = (course) => {
    if (typeof course.instructor === "object") return course.instructor.image;
    return null;
  };

  return (
    <div className="course-list-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="fade-in">Explore Courses</h1>
          <p className="fade-in stagger-1">
            Discover {allCourses.length}+ courses across various categories
          </p>
        </div>
      </div>

      <div className="course-list-container">
        {/* Mobile Filter Button */}
        <button
          className="mobile-filter-btn"
          onClick={() => setShowFilters(true)}
        >
          🔽 Filters
        </button>

        {/* Overlay */}
        {showFilters && (
          <div
            className="filter-overlay"
            onClick={() => setShowFilters(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`filters-sidebar fade-in stagger-2 ${showFilters ? "open" : ""}`}
        >
          <div className="filter-header">
            <h3>Filters</h3>
            <button
              className="filter-close-btn"
              onClick={() => setShowFilters(false)}
            >
              ✕
            </button>
          </div>

          <div className="filter-section">
            <h3>Categories</h3>
            <div className="category-filters">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  className={`filter-btn ${selectedCategory === category ? "active" : ""}`}
                  onClick={() => {
                    setSelectedCategory(category);
                    setShowFilters(false);
                  }}
                >
                  {category}
                  <span className="count">
                    (
                    {category === "All"
                      ? allCourses.length
                      : allCourses.filter(
                          (c) =>
                            c.category?.toLowerCase() ===
                            category.toLowerCase(),
                        ).length}
                    )
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h3>Level</h3>
            <div className="level-filters">
              {["Beginner", "Intermediate", "Advanced"].map((lvl) => (
                <label className="checkbox-label" key={lvl}>
                  <input type="checkbox" />
                  <span>{lvl}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Courses Main */}
        <main className="courses-main">
          <div className="toolbar fade-in stagger-3">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="search-icon">🔍</span>
            </div>

            <div className="sort-dropdown">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          <div className="results-info fade-in stagger-4">
            <p>Showing {filteredCourses.length} courses</p>
          </div>

          {loading ? (
            <div className="no-results">
              <div className="no-results-icon">⏳</div>
              <h3>Loading courses...</h3>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="no-results">
              <div className="no-results-icon">😕</div>
              <h3>No courses found</h3>
              <p>Try adjusting your filters or search query</p>
            </div>
          ) : (
            <div className="courses-grid">
              {filteredCourses.map((course, index) => (
                <Link
                  to={`/course/${course._id}`}
                  className={`course-card fade-in stagger-${(index % 3) + 1}`}
                  key={course._id}
                >
                  <div className="course-thumbnail">
                    <img
                      src={
                        course.thumbnail ||
                        "https://via.placeholder.com/300x200"
                      }
                      alt={course.title}
                    />
                    <span className="course-badge">{course.category}</span>
                    <span className="level-badge">{course.level}</span>
                  </div>

                  <div className="course-content">
                    <h3>{course.title}</h3>
                    <p className="course-description">{course.description}</p>

                    <div className="course-meta">
                      <div className="instructor">
                        {instructorAvatar(course) && (
                          <img
                            src={instructorAvatar(course)}
                            alt={instructorName(course)}
                          />
                        )}
                        <span>{instructorName(course)}</span>
                      </div>
                      <div className="rating">
                        <span className="stars">
                          ⭐ {course.rating || "New"}
                        </span>
                      </div>
                    </div>

                    <div className="course-stats">
                      <span>📚 {course.lessons?.length || 0} lessons</span>
                      <span>🎯 {course.level || "All Levels"}</span>
                    </div>

                    <div className="course-footer">
                      <div className="price">
                        <span className="discount-price">
                          ₹{course.discountPrice || course.price}
                        </span>
                        {course.discountPrice &&
                          course.discountPrice < course.price && (
                            <span className="original-price">
                              ₹{course.price}
                            </span>
                          )}
                      </div>
                      <span className="students">
                        {(course.totalStudents || 0).toLocaleString()} students
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CourseList;
