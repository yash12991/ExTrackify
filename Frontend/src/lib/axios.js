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
  withCredentials: true, // Enable credentials for CORS
// =======
//   baseURL: "https://extrackify-1.onrender.com/api/v1",
//   withCredentials: true,
// >>>>>>> master
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token if available
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login if unauthorized
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
