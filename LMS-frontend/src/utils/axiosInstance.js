// src/utils/axiosInstance.js
import axios from "axios";

const defaultBaseURL = "/api";
const rawApiUrl = import.meta.env.VITE_API_URL;

const normalizeApiUrl = (url) => {
  const trimmed = url.trim();
  if (!trimmed) return defaultBaseURL;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://"))
    return trimmed;
  if (trimmed.startsWith("://")) return `http${trimmed}`;
  if (trimmed.startsWith(":")) return `http://localhost${trimmed}`;
  if (trimmed.startsWith("localhost") || /^[0-9.]+(:[0-9]+)?\//.test(trimmed)) {
    return trimmed.startsWith("http") ? trimmed : `http://${trimmed}`;
  }
  return trimmed;
};

const baseURL = rawApiUrl ? normalizeApiUrl(rawApiUrl) : defaultBaseURL;

const axiosInstance = axios.create({
  baseURL,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token available");

        const res = await axios.post(`${baseURL}/auth/refresh`, {
          refreshToken,
        });

        if (res.data && res.data.success) {
          const newAccess = res.data.accessToken;
          const newRefresh = res.data.refreshToken;
          localStorage.setItem("accessToken", newAccess);
          localStorage.setItem("refreshToken", newRefresh);
          axiosInstance.defaults.headers.common["Authorization"] =
            `Bearer ${newAccess}`;
          processQueue(null, newAccess);
          return axiosInstance(originalRequest);
        }

        processQueue(res.data || "Refresh failed", null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(res.data);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    console.log("Token stored:", localStorage.getItem("accessToken"));

    return Promise.reject(error);
  },
);

export default axiosInstance;
