import axios from "axios";

// Mobile detection utility
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

// Get the base URL from environment variables or use default
const getBaseURL = () => {
  // Check if we have a custom API URL set
  if (import.meta.env.VITE_API_URL) {
    console.log("Using custom API URL:", import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }

  // Auto-detect based on environment
  if (import.meta.env.PROD) {
    // Production - deployed on Vercel
    console.log("Production mode: Using Render backend");
    return "https://extrackify-1.onrender.com/api/v1";
  } else {
    // Development - local server
    console.log("Development mode: Using localhost backend");
    return "http://localhost:3001/api/v1";
  }
};

const baseURL = getBaseURL();
console.log("API Base URL:", baseURL);
console.log("Is Mobile Device:", isMobileDevice());

export const axiosInstance = axios.create({
  baseURL: baseURL,
  withCredentials: !isMobileDevice(), // Disable credentials for mobile
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to handle tokens for mobile
axiosInstance.interceptors.request.use(
  (config) => {
    // For mobile devices, use Authorization header instead of cookies
    if (isMobileDevice()) {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        config.headers["X-Auth-Token"] = token; // Fallback header
      }
    }

    console.log("🚀 Request:", config.method?.toUpperCase(), config.url);
    console.log("🔑 Has Authorization:", !!config.headers.Authorization);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Enhanced response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log("✅ API Response:", response.config.url, response.status);

    // For mobile devices, save tokens from response
    if (isMobileDevice() && response.data?.data?.accessToken) {
      localStorage.setItem("accessToken", response.data.data.accessToken);
      if (response.data.data.refreshToken) {
        localStorage.setItem("refreshToken", response.data.data.refreshToken);
      }
    }

    return response;
  },
  (error) => {
    console.error(
      "❌ API Error:",
      error.config?.url,
      error.response?.status,
      error.response?.data
    );

    if (error.response?.status === 401) {
      // Clear tokens and redirect to login
      if (isMobileDevice()) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }
      console.log("🔄 Unauthorized - redirecting to login");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
