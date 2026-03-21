import axios from "axios";

const configuredBaseUrl = (import.meta.env.VITE_BASE_URL || "").trim();

const baseURL =
  import.meta.env.MODE === "production" && configuredBaseUrl
    ? configuredBaseUrl
    : "http://localhost:5000";

const axiosInstance = axios.create({
  baseURL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    } else {
      delete config.headers.Authorization;
    }
    return config;
  },
  (err) => {
    console.error("Interceptor request error:", err);
    return Promise.reject(err);
  },
);

export default axiosInstance;
