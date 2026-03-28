import axios from "axios";

const configuredBaseUrl = (
  import.meta.env.VITE_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  ""
).trim();

const baseURL = (import.meta.env.DEV ? "" : configuredBaseUrl) || "";

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

axiosInstance.interceptors.response.use(
  (response) => response,
  (err) => {
    const isNetworkError =
      !err?.response &&
      (err?.message === "Network Error" ||
        err?.code === "ERR_NETWORK" ||
        err?.code === "ECONNREFUSED");

    if (isNetworkError) {
      err.response = {
        data: {
          success: false,
          message: "Server is offline. Please start the backend.",
        },
        status: 503,
      };
    }

    return Promise.reject(err);
  },
);

export default axiosInstance;
