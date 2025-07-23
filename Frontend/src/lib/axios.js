import axios from "axios";

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

export const axiosInstance = axios.create({
  baseURL: baseURL,
  withCredentials: true, // This is CRITICAL for cookies to work cross-origin
  headers: {
    "Content-Type": "application/json",
  },
});

// For cookie-based auth, we don't need to manually add Authorization headers
// The browser will automatically include httpOnly cookies in requests

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    console.log("✅ API Response:", response.config.url, response.status);
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
      // For cookie-based auth, just redirect to login
      // Don't try to remove tokens from localStorage since we're using cookies
      console.log("🔄 Unauthorized - redirecting to login");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
