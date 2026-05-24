import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Home.css";
import axiosInstance from "../utils/axiosInstance";
import {
  GraduationCap,
  Play,
  Users,
  Award,
  BookOpen,
  ArrowRight,
  Star,
  CheckCircle,
  TrendingUp,
  Globe,
  Zap,
} from "lucide-react";

const CATEGORIES = [
  { name: "Development", emoji: "💻", color: "#3b82f6" },
  { name: "Design", emoji: "🎨", color: "#ec4899" },
  { name: "Data Science", emoji: "📊", color: "#8b5cf6" },
  { name: "Business", emoji: "💼", color: "#10b981" },
  { name: "Marketing", emoji: "📈", color: "#f59e0b" },
];

const FEATURES = [
  {
    icon: <GraduationCap size={28} />,
    title: "Expert Instructors",
    desc: "Learn from industry professionals with real-world experience",
  },
  {
    icon: <Globe size={28} />,
    title: "Learn Anywhere",
    desc: "Access courses on any device, anytime at your own pace",
  },
  {
    icon: <Award size={28} />,
    title: "Certificates",
    desc: "Earn verified certificates to showcase your skills",
  },
  {
    icon: <Zap size={28} />,
    title: "Practical Projects",
    desc: "Build real projects that strengthen your portfolio",
  },
  {
    icon: <Users size={28} />,
    title: "Community Support",
    desc: "Connect with learners and get help anytime",
  },
  {
    icon: <TrendingUp size={28} />,
    title: "Lifetime Access",
    desc: "One-time payment for unlimited, forever access",
  },
];

const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    role: "Frontend Developer",
    text: "EGuru helped me land my first dev job. The courses are practical and the certificate actually matters.",
    avatar: "PS",
  },
  {
    name: "Rahul Mehta",
    role: "Data Analyst",
    text: "Best platform for structured learning. I completed 3 courses and got promoted within 6 months.",
    avatar: "RM",
  },
  {
    name: "Neha Joshi",
    role: "UX Designer",
    text: "The projects are real-world focused. I built my portfolio entirely from EGuru coursework.",
    avatar: "NJ",
  },
];

const Home = () => {
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data } = await axiosInstance.get("/course/all?limit=100");
        if (data.success) {
          setAllCourses(data.courses);
          setFeaturedCourses(data.courses.slice(0, 3));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const instructorName = (course) => {
    if (!course.instructor) return "EGuru Instructor";
    if (typeof course.instructor === "object")
      return course.instructor.name || "EGuru Instructor";
    return course.instructor;
  };

  return (
    <div className="home">
      {/* HERO */}
      <section className="hero">
        <div className="hero__glow hero__glow--left" />
        <div className="hero__glow hero__glow--right" />
        <div className="hero__container">
          <div className="hero__badge">
            <Zap size={13} /> India's fastest growing LMS platform
          </div>
          <h1 className="hero__title">
            Master Skills That
            <br />
            <span className="hero__accent">Matter</span>
          </h1>
          <p className="hero__subtitle">
            Learn from industry experts. Build real projects. Advance your
            career with courses designed for the modern professional.
          </p>
          <div className="hero__actions">
            <Link to="/courses" className="btn btn--primary">
              Explore All Courses <ArrowRight size={17} />
            </Link>
            <Link
              to="/login"
              state={{ register: true, role: "instructor" }}
              className="btn btn--ghost"
            >
              <Play size={14} fill="currentColor" /> Become an Instructor
            </Link>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="section">
        <div className="section__inner">
          <div className="section__head">
            <h2>
              Explore by <span className="text--accent">Category</span>
            </h2>
            <p>Discover courses across various domains</p>
          </div>
          <div className="cat-grid">
            {CATEGORIES.map((cat) => (
              <Link
                to={`/courses?category=${cat.name.toLowerCase()}`}
                className="cat-card"
                key={cat.name}
                style={{ "--cat-color": cat.color }}
              >
                <span className="cat-card__emoji">{cat.emoji}</span>
                <h3>{cat.name}</h3>
                <p>
                  {
                    allCourses.filter(
                      (c) =>
                        c.category?.toLowerCase() === cat.name.toLowerCase(),
                    ).length
                  }{" "}
                  courses
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED COURSES */}
      <section className="section section--alt">
        <div className="section__inner">
          <div className="section__head">
            <h2>
              Featured <span className="text--accent">Courses</span>
            </h2>
            <p>Start learning with our most popular courses</p>
          </div>
          {loading ? (
            <div className="course-grid">
              {[1, 2, 3].map((n) => (
                <div key={n} className="course-skeleton" />
              ))}
            </div>
          ) : featuredCourses.length === 0 ? (
            <p className="empty-msg">
              No published courses yet. Check back soon!
            </p>
          ) : (
            <div className="course-grid">
              {featuredCourses.map((course) => (
                <Link
                  to={`/course/${course._id}`}
                  className="course-card"
                  key={course._id}
                >
                  <div className="course-card__thumb">
                    <img
                      src={
                        course.thumbnail ||
                        "https://via.placeholder.com/400x220"
                      }
                      alt={course.title}
                    />
                    <span className="course-card__badge">
                      {course.category}
                    </span>
                    {course.level && (
                      <span className="course-card__level">{course.level}</span>
                    )}
                  </div>
                  <div className="course-card__body">
                    <h3>{course.title}</h3>
                    <p className="course-card__desc">{course.description}</p>
                    <div className="course-card__meta">
                      <div className="course-card__instructor">
                        {typeof course.instructor === "object" &&
                        course.instructor?.image ? (
                          <img
                            src={course.instructor.image}
                            alt={instructorName(course)}
                          />
                        ) : (
                          <div className="course-card__avatar">
                            {instructorName(course).charAt(0)}
                          </div>
                        )}
                        <span>{instructorName(course)}</span>
                      </div>
                      <div className="course-card__rating">
                        <Star size={12} fill="#f5a623" color="#f5a623" />
                        <span>{course.rating || "New"}</span>
                      </div>
                    </div>
                    <div className="course-card__stats">
                      <span>📚 {course.lessons?.length || 0} lessons</span>
                      <span>🌐 {course.language || "English"}</span>
                    </div>
                    <div className="course-card__footer">
                      <div className="course-card__price">
                        <span className="price--current">
                          ₹
                          {course.discountPrice?.toLocaleString("en-IN") ||
                            course.price?.toLocaleString("en-IN")}
                        </span>
                        {course.discountPrice &&
                          course.discountPrice < course.price && (
                            <span className="price--original">
                              ₹{course.price?.toLocaleString("en-IN")}
                            </span>
                          )}
                      </div>
                      <span className="course-card__students">
                        {(course.totalStudents || 0).toLocaleString()} students
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <div className="section__cta">
            <Link to="/courses" className="btn btn--outline">
              View All Courses <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* WHY EGURU */}
      <section className="section">
        <div className="section__inner">
          <div className="section__head">
            <h2>
              Why Choose <span className="text--accent">EGuru?</span>
            </h2>
            <p>Everything you need to succeed in your learning journey</p>
          </div>
          <div className="features-grid">
            {FEATURES.map((f) => (
              <div className="feature-card" key={f.title}>
                <div className="feature-card__icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section section--alt">
        <div className="section__inner">
          <div className="section__head">
            <h2>
              What Our <span className="text--accent">Students</span> Say
            </h2>
            <p>Real results from real learners</p>
          </div>
          <div className="testi-grid">
            {TESTIMONIALS.map((t) => (
              <div className="testi-card" key={t.name}>
                <div className="testi-card__stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={13} fill="#f5a623" color="#f5a623" />
                  ))}
                </div>
                <p className="testi-card__text">"{t.text}"</p>
                <div className="testi-card__author">
                  <div className="testi-card__avatar">{t.avatar}</div>
                  <div>
                    <strong>{t.name}</strong>
                    <span>{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="cta-banner">
        <div className="cta-banner__glow" />
        <div className="cta-banner__inner">
          <GraduationCap size={46} className="cta-banner__icon" />
          <h2>Start Learning Today</h2>
          <p>Join 50,000+ students already building their future on EGuru</p>
          <div className="cta-banner__actions">
            <Link to="/courses" className="btn btn--primary">
              Browse Courses <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              state={{ register: true }}
              className="btn btn--ghost-light"
            >
              Create Free Account
            </Link>
          </div>
          <div className="cta-banner__checks">
            {[
              "No credit card required",
              "Cancel anytime",
              "Free preview lessons",
            ].map((t) => (
              <span key={t}>
                <CheckCircle size={13} /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
