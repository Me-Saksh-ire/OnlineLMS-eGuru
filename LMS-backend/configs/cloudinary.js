import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

const cleanEnv = (value) =>
  String(value || "")
    .trim()
    .replace(/^['"]+|['"]+$/g, "");

const cloudName = cleanEnv(process.env.CLOUDINARY_CLOUD_NAME);
const apiKey = cleanEnv(process.env.CLOUDINARY_API_KEY);
const apiSecret = cleanEnv(process.env.CLOUDINARY_API_SECRET);

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error(
    "Cloudinary environment variables are required: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET",
  );
}

console.log("Cloudinary config loaded:", {
  cloudName,
  apiKeySet: Boolean(apiKey),
  apiSecretSet: Boolean(apiSecret),
});

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

// Image storage — for course thumbnails
export const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "eguru/thumbnails",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 800, height: 450, crop: "fill" }],
  },
});

// Video storage — for lessons
export const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "eguru/videos",
    resource_type: "video",
    allowed_formats: ["mp4", "mov", "avi", "mkv"],
  },
});

export const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "eguru/avatars",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      { width: 200, height: 200, crop: "fill", gravity: "face" },
    ],
  },
});

export const uploadAvatar = multer({ storage: avatarStorage });
export const uploadImage = multer({ storage: imageStorage });
export const uploadVideo = multer({ storage: videoStorage });

export default cloudinary;
