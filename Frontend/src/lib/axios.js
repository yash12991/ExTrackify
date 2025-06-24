import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "http://localhost:3001/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add response interceptor to handle unauthorized responses
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login or refresh token
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
