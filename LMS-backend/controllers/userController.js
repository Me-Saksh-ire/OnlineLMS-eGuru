import User from "../models/User.js";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import upload from "../middlewares/mutler.js";

// GET /api/user/profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password -refreshToken",
    );
    if (!user) return res.json({ success: false, message: "User not found" });
    return res.json({ success: true, user });
  } catch (error) {
    console.log(error.message);
    return res.json({ success: false, message: error.message });
  }
};

// PUT /api/user/profile
export const updateProfile = async (req, res) => {
  try {
    const { name, bio, image } = req.body;

    if (!name?.trim())
      return res.json({ success: false, message: "Name cannot be empty" });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, bio, image },
      { new: true },
    ).select("-password -refreshToken");

    return res.json({ success: true, user });
  } catch (error) {
    console.log(error.message);
    return res.json({ success: false, message: error.message });
  }
};

// PUT /api/user/change-password
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword || newPassword.length < 8)
      return res.json({
        success: false,
        message: "New password must be at least 8 characters",
      });

    const user = await User.findById(req.user.id);
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res.json({ success: false, message: "Old password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.log(error.message);
    return res.json({ success: false, message: error.message });
  }
};

// GET /api/user/all  (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -refreshToken");
    return res.json({ success: true, users });
  } catch (error) {
    console.log(error.message);
    return res.json({ success: false, message: error.message });
  }
};

// DELETE /api/user/:id  (admin only)
export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.log(error.message);
    return res.json({ success: false, message: error.message });
  }
};

// POST /api/user/avatar
export const uploadUserAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const imageUrl = req.file.path || req.file.secure_url || req.file.url;
    if (!imageUrl) {
      throw new Error("Upload failed, no image URL returned");
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { image: imageUrl },
      { new: true },
    ).select("-password -refreshToken");

    res.json({ success: true, user });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/user/upload-signature
export const uploadSignature = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const signatureUrl = req.file.path || req.file.secure_url || req.file.url;
    if (!signatureUrl) {
      throw new Error("Upload failed, no signature URL returned");
    }

    await User.findByIdAndUpdate(req.user.id, {
      signature: signatureUrl,
    });
    return res.json({ success: true, signature: signatureUrl });
  } catch (e) {
    console.error(e.message);
    return res.status(500).json({ success: false, message: e.message });
  }
};
