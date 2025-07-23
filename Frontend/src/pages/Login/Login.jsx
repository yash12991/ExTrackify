import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { login } from "../../lib/api";
import Loader from "../../components/Loading/Loading";
import "./Login.css";
import img from "../../assets/image.png";
const Login = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Clear error when component unmounts
  useEffect(() => {
    return () => setError("");
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value.trim(), // Remove whitespace
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      console.log("🔄 Attempting login...");
      const response = await login(formData);
      console.log("✅ Login successful:", response);

      // For cookie-based auth, we don't need to store tokens manually
      // The httpOnly cookie is automatically set by the browser

      // Clear any cached data and redirect
      queryClient.invalidateQueries();
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      console.error("❌ Login error:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Login failed";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="body">
      <div>{isLoading ? <Loader /> : null} </div>
      <img
        src={img}
        alt="logo"
        onClick={() => navigate("/")}
        style={{ display: "flex", height: "80px" }}
      />
      <h1>EXTRAKIFY</h1>
      <div className="form-container">
        <div className="left-container">
          <h1>Login</h1>
          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="label" htmlFor="email">
                <span className="label-text">Email</span>
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="label" htmlFor="password">
                <span className="label-text">Password</span>
              </label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
                minLength={6}
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="btn" disabled={isLoading}>
              {isLoading ? <span>Logging in...</span> : <span>Login</span>}
            </button>

            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <Link
                href="#"
                style={{ color: "#667eea", textDecoration: "none" }}
              >
                Forgot Password?
              </Link>
            </div>
            <div style={{ textAlign: "center" }}>
              NewUser Signup?
              <Link
                className="hover:underline hover:text-blue-500"
                to={"/signup"}
              >
                Here
              </Link>
            </div>
          </form>
        </div>

        <div className="right-container">
          <div className="right-content">
            <h2
              style={{
                fontSize: "2rem",
                marginBottom: "1rem",
                textAlign: "center",
              }}
            >
              Welcome Back!
            </h2>
            <p
              style={{
                fontSize: "1.1rem",
                textAlign: "center",
                maxWidth: "80%",
                margin: "0 auto",
              }}
            >
              Track your expenses efficiently and take control of your finances
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
