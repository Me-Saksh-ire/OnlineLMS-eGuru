import React, { useRef, useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import html2canvas from "html2canvas";

const Certificate = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const certificateRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [user, setUser] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const fetchData = async () => {
    try {
      const [courseRes, progressRes, profileRes] = await Promise.all([
        axiosInstance.get(`/course/${courseId}`),
        axiosInstance.get(`/enrollment/progress/${courseId}`),
        axiosInstance.get("/user/profile"), // adjust to your profile endpoint
      ]);

      if (courseRes.data.success) setCourse(courseRes.data.course);
      if (progressRes.data.success) setProgress(progressRes.data);
      if (profileRes.data.success) setUser(profileRes.data.user);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = async () => {
    if (!certificateRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `certificate-${course.title.replace(/\s+/g, "-").toLowerCase()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      alert("Download failed, please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const shareCertificate = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "Course Certificate",
        text: `I just completed "${course.title}" on EGuru!`,
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert("Certificate link copied to clipboard!");
    }
  };

  // ── Loading state ──────────────────────────────────────────
  if (loading) {
    return (
      <div style={styles.fullPage}>
        <p style={{ color: "#9ca3af" }}>Checking your progress...</p>
      </div>
    );
  }

  // ── Not enrolled / course missing ─────────────────────────
  if (!progress?.success || !course) {
    return (
      <div style={styles.fullPage}>
        <div style={styles.gateCard}>
          <span style={{ fontSize: "2.5rem" }}>🔒</span>
          <h2 style={styles.gateTitle}>Access Denied</h2>
          <p style={styles.gateText}>You are not enrolled in this course.</p>
          <button style={styles.btn} onClick={() => navigate("/courses")}>
            Browse Courses
          </button>
        </div>
      </div>
    );
  }

  // ── Not completed ──────────────────────────────────────────
  if (!progress.isCompleted) {
    return (
      <div style={styles.fullPage}>
        <div style={styles.gateCard}>
          <span style={{ fontSize: "2.5rem" }}>📚</span>
          <h2 style={styles.gateTitle}>Course Not Yet Complete</h2>
          <p style={styles.gateText}>
            You've completed{" "}
            <strong style={{ color: "#f5a623" }}>
              {progress.completedCount} of {progress.totalLessons}
            </strong>{" "}
            lessons.
          </p>

          {/* Progress bar */}
          <div style={styles.progressWrap}>
            <div style={styles.progressBg}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${progress.percentage}%`,
                }}
              />
            </div>
            <span style={styles.progressLabel}>{progress.percentage}%</span>
          </div>

          <p
            style={{
              color: "#6b7280",
              fontSize: "0.85rem",
              marginBottom: "1.5rem",
            }}
          >
            Complete all lessons to unlock your certificate.
          </p>
          <button
            style={styles.btn}
            onClick={() => navigate(`/course/${courseId}`)}
          >
            Continue Learning →
          </button>
        </div>
      </div>
    );
  }

  // ── Certificate ────────────────────────────────────────────
  const completionDate = progress.completedAt
    ? new Date(progress.completedAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  const certificateId = `EGURU-${courseId?.slice(-6).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
  const instructorName =
    typeof course.instructor === "object"
      ? course.instructor.name
      : course.instructor || "EGuru Instructor";

  return (
    <div style={styles.page}>
      {/* Page header */}
      <div style={styles.pageHeader}>
        <div style={styles.successBadge}>
          <span>✅</span>
          <span>Course Completed!</span>
        </div>
        <h1 style={styles.pageTitle}>
          Congratulations, {user?.name || "Student"}! 🎉
        </h1>
        <p style={styles.pageSubtitle}>
          You've completed all {progress.totalLessons} lessons. Here's your
          certificate.
        </p>
      </div>

      {/* ── Certificate card ── */}
      <div style={styles.certOuter}>
        <div ref={certificateRef} style={styles.certInner}>
          {/* Decorative corner accents */}
          <div
            style={{
              ...styles.corner,
              top: 12,
              left: 12,
              borderWidth: "3px 0 0 3px",
            }}
          />
          <div
            style={{
              ...styles.corner,
              top: 12,
              right: 12,
              borderWidth: "3px 3px 0 0",
            }}
          />
          <div
            style={{
              ...styles.corner,
              bottom: 12,
              left: 12,
              borderWidth: "0 0 3px 3px",
            }}
          />
          <div
            style={{
              ...styles.corner,
              bottom: 12,
              right: 12,
              borderWidth: "0 3px 3px 0",
            }}
          />

          <div style={styles.certContent}>
            {/* Logo mark */}
            <div style={styles.logoMark}>🎓</div>

            {/* Brand */}
            <p style={styles.certSubhead}>Certificate of Completion</p>
            <h2 style={styles.certBrand}>EGuru</h2>

            <p style={styles.certBody}>This is to certify that</p>

            {/* Student name */}
            <div style={styles.nameWrap}>
              <h3 style={styles.studentName}>{user?.name || "Student"}</h3>
            </div>

            <p style={styles.certBody}>has successfully completed the course</p>

            {/* Course title */}
            <h4 style={styles.courseTitle}>{course.title}</h4>
            <p
              style={{
                ...styles.certBody,
                fontSize: "0.8rem",
                marginBottom: "2rem",
              }}
            >
              an online course authorized by EGuru
            </p>

            {/* Meta row */}
            <div style={styles.metaRow}>
              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>📅 Completed on</span>
                <span style={styles.metaValue}>{completionDate}</span>
              </div>
              <div style={styles.metaDivider} />
              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>👤 Instructor</span>
                <span style={styles.metaValue}>{instructorName}</span>
              </div>
            </div>

            {/* Signature lines */}
            <div style={styles.sigRow}>
              <div style={styles.sigItem}>
                <div style={styles.sigLine} />
                <span style={styles.sigLabel}>Course Instructor</span>
              </div>
              <div style={styles.sigItem}>
                <div style={styles.sigLine} />
                <span style={styles.sigLabel}>EGuru CEO</span>
              </div>
            </div>

            {/* Certificate ID */}
            <p style={styles.certId}>Certificate ID: {certificateId}</p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div style={styles.actions}>
        <button
          style={styles.btn}
          onClick={downloadCertificate}
          disabled={isDownloading}
        >
          {isDownloading ? "Downloading..." : "⬇️ Download Certificate"}
        </button>
        <button style={styles.btnOutline} onClick={shareCertificate}>
          🔗 Share
        </button>
        <button style={styles.btnOutline} onClick={() => window.print()}>
          🖨️ Print
        </button>
      </div>

      <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
        <button
          style={{
            ...styles.btnOutline,
            borderColor: "transparent",
            color: "#6b7280",
          }}
          onClick={() => navigate("/student-dashboard")}
        >
          ← Back to My Courses
        </button>
      </div>
    </div>
  );
};

// ── Styles ─────────────────────────────────────────────────────
const styles = {
  page: {
    minHeight: "100vh",
    background: "#0d0f1a",
    fontFamily: "'DM Sans', sans-serif",
    padding: "2.5rem 1.5rem",
  },
  fullPage: {
    minHeight: "100vh",
    background: "#0d0f1a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'DM Sans', sans-serif",
  },
  gateCard: {
    background: "#111320",
    border: "1px solid #1e2130",
    borderRadius: "16px",
    padding: "2.5rem 2rem",
    textAlign: "center",
    maxWidth: "400px",
    width: "100%",
  },
  gateTitle: {
    fontFamily: "'Sora', sans-serif",
    fontSize: "1.3rem",
    fontWeight: 800,
    color: "#fff",
    margin: "0.75rem 0 0.5rem",
  },
  gateText: {
    color: "#9ca3af",
    fontSize: "0.9rem",
    marginBottom: "1.25rem",
  },
  progressWrap: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    marginBottom: "1.25rem",
  },
  progressBg: {
    flex: 1,
    height: "8px",
    background: "#1a1d2e",
    borderRadius: "99px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #f5a623, #e09516)",
    borderRadius: "99px",
    transition: "width 0.4s ease",
  },
  progressLabel: {
    fontSize: "0.82rem",
    color: "#f5a623",
    fontWeight: 700,
    minWidth: "36px",
  },
  btn: {
    background: "#f5a623",
    border: "none",
    color: "#0d0f1a",
    borderRadius: "9px",
    padding: "0.75rem 1.75rem",
    fontSize: "0.9rem",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "'Sora', sans-serif",
  },
  btnOutline: {
    background: "transparent",
    border: "1.5px solid #2a2d3e",
    color: "#e5e7eb",
    borderRadius: "9px",
    padding: "0.75rem 1.75rem",
    fontSize: "0.9rem",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  pageHeader: {
    textAlign: "center",
    marginBottom: "2rem",
  },
  successBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4rem",
    background: "rgba(16,185,129,0.1)",
    border: "1px solid rgba(16,185,129,0.25)",
    color: "#10b981",
    borderRadius: "999px",
    padding: "0.3rem 1rem",
    fontSize: "0.82rem",
    fontWeight: 600,
    marginBottom: "0.75rem",
  },
  pageTitle: {
    fontFamily: "'Sora', sans-serif",
    fontSize: "1.8rem",
    fontWeight: 800,
    color: "#fff",
    margin: "0 0 0.4rem",
  },
  pageSubtitle: {
    color: "#6b7280",
    fontSize: "0.9rem",
  },
  certOuter: {
    maxWidth: "820px",
    margin: "0 auto 2rem",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
  },
  certInner: {
    position: "relative",
    background: "linear-gradient(135deg, #fffdf7 0%, #fff 50%, #f9f6ff 100%)",
    padding: "3.5rem 3rem",
  },
  corner: {
    position: "absolute",
    width: "28px",
    height: "28px",
    borderColor: "#f5a623",
    borderStyle: "solid",
  },
  certContent: {
    textAlign: "center",
    position: "relative",
    zIndex: 1,
  },
  logoMark: {
    fontSize: "3rem",
    marginBottom: "0.5rem",
  },
  certSubhead: {
    fontSize: "0.75rem",
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: "#9ca3af",
    margin: "0 0 0.25rem",
  },
  certBrand: {
    fontFamily: "'Sora', sans-serif",
    fontSize: "2.5rem",
    fontWeight: 800,
    background: "linear-gradient(135deg, #f5a623, #e09516)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: "0 0 1.5rem",
  },
  certBody: {
    color: "#6b7280",
    fontSize: "0.9rem",
    margin: "0 0 0.5rem",
  },
  nameWrap: {
    margin: "0.5rem 0 1rem",
    paddingBottom: "0.75rem",
    borderBottom: "2px solid rgba(245,166,35,0.3)",
    display: "inline-block",
    paddingLeft: "2rem",
    paddingRight: "2rem",
  },
  studentName: {
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: "2.2rem",
    fontWeight: 700,
    color: "#111",
    margin: 0,
  },
  courseTitle: {
    fontFamily: "'Sora', sans-serif",
    fontSize: "1.3rem",
    fontWeight: 700,
    color: "#111320",
    margin: "0.25rem 0 0.5rem",
  },
  metaRow: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "2rem",
    margin: "0 0 2rem",
    flexWrap: "wrap",
  },
  metaItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.2rem",
  },
  metaLabel: {
    fontSize: "0.75rem",
    color: "#9ca3af",
  },
  metaValue: {
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#111",
  },
  metaDivider: {
    width: "1px",
    height: "36px",
    background: "#e5e7eb",
  },
  sigRow: {
    display: "flex",
    justifyContent: "center",
    gap: "4rem",
    marginBottom: "1.5rem",
    flexWrap: "wrap",
  },
  sigItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.4rem",
  },
  sigLine: {
    width: "120px",
    height: "1px",
    background: "rgba(0,0,0,0.2)",
  },
  sigLabel: {
    fontSize: "0.75rem",
    color: "#9ca3af",
  },
  certId: {
    fontSize: "0.7rem",
    color: "#d1d5db",
    letterSpacing: "0.05em",
  },
  actions: {
    display: "flex",
    justifyContent: "center",
    gap: "1rem",
    flexWrap: "wrap",
    marginBottom: "1rem",
  },
};

export default Certificate;
