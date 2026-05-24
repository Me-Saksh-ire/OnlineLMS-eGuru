import React, { useState, useEffect, useRef } from "react";
import { useAppContext } from "../context/AppContext";
import axiosInstance from "../utils/axiosInstance";
import "./ProfilePage.css";
import { Camera, User, Pencil, Upload } from "lucide-react";

const ProfilePage = () => {
  const { user, setUser } = useAppContext();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [sigFile, setSigFile] = useState(null);
  const [sigPreview, setSigPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [activeTab, setActiveTab] = useState("profile");
  const fileRef = useRef();
  const sigRef = useRef();

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setBio(user.bio || "");
      setPreview(user.image || "");
      setSigPreview(user.signature || "");
    }
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSigChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSigFile(file);
      setSigPreview(URL.createObjectURL(file));
    }
  };

  const uploadAvatar = async () => {
    const formData = new FormData();
    formData.append("avatar", imageFile);
    const { data } = await axiosInstance.post("/user/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.user.image;
  };

  const uploadSignature = async () => {
    const formData = new FormData();
    formData.append("signature", sigFile);
    const { data } = await axiosInstance.post(
      "/user/upload-signature",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return data.signature;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      let imageUrl = user.image;
      let sigUrl = user.signature;

      if (imageFile) {
        const newImage = await uploadAvatar();
        if (newImage) imageUrl = newImage;
      }
      if (sigFile) {
        const newSig = await uploadSignature();
        if (newSig) sigUrl = newSig;
      }

      const { data } = await axiosInstance.put("/user/profile", {
        name,
        bio,
        image: imageUrl,
        signature: sigUrl,
      });

      if (data.success) {
        setUser(data.user);
        setMessage({ text: "Profile updated successfully!", type: "success" });
        setImageFile(null);
        setSigFile(null);
      } else {
        setMessage({ text: data.message, type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Something went wrong", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="pp-loading">Loading...</div>;

  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="pp-page">
      <div className="pp-card">
        {/* ── Top hero strip ── */}
        <div className="pp-hero">
          <div className="pp-hero-avatar">
            {preview ? (
              <img src={preview} alt="avatar" className="pp-avatar-img" />
            ) : (
              <div className="pp-avatar-initials">{initials}</div>
            )}
            <button
              type="button"
              className="pp-avatar-edit"
              onClick={() => fileRef.current?.click()}
              title="Change photo"
            >
              <Pencil size={14} />
            </button>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileRef}
              hidden
            />
          </div>
          <div className="pp-hero-info">
            <h2 className="pp-hero-name">{user.name}</h2>
            <span className="pp-hero-role">{user.role || "Student"}</span>
            {user.email && <p className="pp-hero-email">{user.email}</p>}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="pp-tabs">
          <button
            type="button"
            className={`pp-tab ${activeTab === "profile" ? "pp-tab--active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <User size={14} /> Profile Info
          </button>
          <button
            type="button"
            className={`pp-tab ${activeTab === "signature" ? "pp-tab--active" : ""}`}
            onClick={() => setActiveTab("signature")}
          >
            <Pencil size={14} /> Signature
          </button>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit}>
          {activeTab === "profile" && (
            <div className="pp-section">
              <div className="pp-field">
                <label>Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Your full name"
                />
              </div>

              <div className="pp-field">
                <label>Email</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="pp-input--disabled"
                />
                <span className="pp-field-hint">Email cannot be changed</span>
              </div>

              <div className="pp-field">
                <label>Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows="4"
                  placeholder="Tell others about yourself..."
                />
              </div>

              <div className="pp-field">
                <label>Profile Photo</label>
                <div
                  className="pp-upload-box"
                  onClick={() => fileRef.current?.click()}
                >
                  {imageFile ? (
                    <div className="pp-upload-preview">
                      <img src={preview} alt="preview" />
                      <span>{imageFile.name}</span>
                    </div>
                  ) : (
                    <div className="pp-upload-placeholder">
                      <Camera size={18} />
                      <span className="pp-upload-icon"></span>
                      <span>Click to upload photo</span>
                      <span className="pp-upload-hint">PNG, JPG up to 5MB</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "signature" && (
            <div className="pp-section">
              <div className="pp-sig-current">
                <label>Current Signature</label>
                {sigPreview ? (
                  <div className="pp-sig-preview-wrap">
                    <img
                      src={sigPreview}
                      alt="signature"
                      className="pp-sig-preview"
                    />
                  </div>
                ) : (
                  <div className="pp-sig-empty">No signature uploaded yet</div>
                )}
              </div>

              <div className="pp-field">
                <label>Upload New Signature</label>
                <div
                  className="pp-upload-box pp-sig-box"
                  onClick={() => sigRef.current?.click()}
                >
                  {sigFile ? (
                    <div className="pp-upload-preview">
                      <img
                        src={sigPreview}
                        alt="new sig"
                        className="pp-sig-preview-new"
                      />
                      <span>{sigFile.name}</span>
                    </div>
                  ) : (
                    <div className="pp-upload-placeholder">
                      <span className="pp-upload-icon">
                        <Upload size={18} />
                      </span>
                      <span>Click to upload signature</span>
                      <span className="pp-upload-hint">
                        Transparent PNG recommended · Max 2MB
                      </span>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSigChange}
                  ref={sigRef}
                  hidden
                />
              </div>

              <div className="pp-sig-tip">
                <span>💡</span>
                <p>
                  Write your signature on white paper, photograph it, then
                  remove the background using a free tool like{" "}
                  <strong>remove.bg</strong> for best results.
                </p>
              </div>
            </div>
          )}

          <div className="pp-form-footer">
            {message.text && (
              <div className={`pp-message pp-message--${message.type}`}>
                {message.type === "success" ? "✅" : "⚠️"} {message.text}
              </div>
            )}
            <button type="submit" className="pp-save-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="pp-btn-spinner" /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
