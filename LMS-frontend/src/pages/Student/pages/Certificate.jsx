import { useParams, Link } from "react-router-dom";
import { useAppContext } from "../../../context/AppContext";
import { useEffect, useState, useRef } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import { assets } from "../../../assets/assets"; // ← import assets for eguruSignature
import {
  Award,
  Download,
  Share2,
  Printer,
  CheckCircle,
  Calendar,
  User,
} from "lucide-react";
import "./Certificate.css";

const Certificate = () => {
  const { courseId } = useParams();
  const { user } = useAppContext();
  const certRef = useRef(null);
  const [course, setCourse] = useState(null);
  const [completedAt, setCompletedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const completionDate = completedAt
    ? new Date(completedAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  const certId = `EGURU-${course?._id?.slice(-6).toUpperCase()}-${user?._id?.slice(-4).toUpperCase()}`;

  const instructorName =
    typeof course?.instructor === "object"
      ? course?.instructor?.name
      : course?.instructor || "EGuru Instructor";

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(certRef.current, {
        scale: 3, // higher scale = sharper download
        backgroundColor: "#ffffff",
        useCORS: true, // needed if signature is from external URL
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `certificate-${course?.title?.replace(/\s+/g, "-").toLowerCase()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      alert("Download failed. Try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    const text = `I just completed "${course?.title}" on EGuru!`;
    if (navigator.share) {
      await navigator.share({
        title: "EGuru Certificate",
        text,
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, progressRes] = await Promise.all([
          axiosInstance.get(`/course/${courseId}`),
          axiosInstance.get(`/enrollment/progress/${courseId}`),
        ]);
        if (courseRes.data.success) setCourse(courseRes.data.course);
        if (progressRes.data.success) {
          if (!progressRes.data.isCompleted) {
            window.location.href = `/course/${courseId}`;
            return;
          }
          setCompletedAt(progressRes.data.completedAt);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId]);

  if (loading)
    return (
      <div style={{ padding: "4rem", textAlign: "center" }}>Loading...</div>
    );
  if (!course)
    return (
      <div style={{ padding: "4rem", textAlign: "center" }}>
        Course not found.
      </div>
    );

  // Resolve instructor signature — could be a URL from DB or fallback
  const instructorSignature =
    typeof course?.instructor === "object"
      ? course?.instructor?.signature
      : null;

  return (
    <div className="cert-page">
      {/* Success badge */}
      <div className="cert-top">
        <span className="cert-success-badge">
          <CheckCircle size={16} /> Course completed!
        </span>
        <h1>Congratulations, {user?.name}! 🎉</h1>
        <p>
          You've successfully completed the course. Here's your certificate.
        </p>
      </div>

      {/* Certificate */}
      <div className="cert-wrapper" ref={certRef}>
        <div className="cert-border-outer" />
        <div className="cert-border-inner" />
        <div className="cert-body">
          <div className="cert-logo-wrap">
            <div className="cert-logo-icon">
              <Award size={28} color="#fff" />
            </div>
          </div>

          <p className="cert-sub-title">Certificate of Completion</p>
          <h2 className="cert-brand">EGuru</h2>

          <p className="cert-certifies">This is to certify that</p>

          <div className="cert-name-wrap">
            <h3 className="cert-name">{user?.name}</h3>
          </div>

          <p className="cert-has">has successfully completed the course</p>
          <h4 className="cert-course-title">{course?.title}</h4>
          <p className="cert-authorized">
            an online course authorized by EGuru
          </p>

          <div className="cert-meta">
            <div className="cert-meta-item">
              <Calendar size={14} />
              <span className="cert-meta-lbl">Completed on</span>
              <span className="cert-meta-val">{completionDate}</span>
            </div>
            <div className="cert-divider" />
            <div className="cert-meta-item">
              <User size={14} />
              <span className="cert-meta-lbl">Instructor</span>
              <span className="cert-meta-val">{instructorName}</span>
            </div>
          </div>

          {/* ── Signatures ── */}
          <div className="cert-signatures">
            {/* Instructor signature */}
            <div className="cert-sig">
              <div className="cert-sig-img-wrap">
                {instructorSignature ? (
                  <img
                    src={instructorSignature}
                    alt="Instructor signature"
                    className="cert-sig-img"
                    crossOrigin="anonymous"
                  />
                ) : (
                  // Blank line fallback if no signature uploaded
                  <div className="cert-sig-line" />
                )}
              </div>
              <p>{instructorName}</p>
              <p className="cert-sig-role">Course Instructor</p>
            </div>

            {/* EGuru CEO signature — uses eguruSignature from assets */}
            <div className="cert-sig">
              <div className="cert-sig-img-wrap">
                <img
                  src={assets.eguruSignature}
                  alt="EGuru CEO signature"
                  className="cert-sig-img"
                />
              </div>
              <p>EGuru Platform</p>
              <p className="cert-sig-role">EGuru CEO</p>
            </div>
          </div>

          <p className="cert-id">Certificate ID: {certId}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="cert-actions">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="cert-btn cert-btn--primary"
        >
          <Download size={15} /> {downloading ? "Downloading..." : "Download"}
        </button>
        <button onClick={handleShare} className="cert-btn cert-btn--outline">
          <Share2 size={15} /> Share
        </button>
        <button
          onClick={() => window.print()}
          className="cert-btn cert-btn--outline"
        >
          <Printer size={15} /> Print
        </button>
      </div>

      <div className="cert-back">
        <Link to="/student-dashboard">← Back to dashboard</Link>
      </div>
    </div>
  );
};

export default Certificate;
