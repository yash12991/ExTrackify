import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../../lib/api";

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullname: "",
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
     
      await signup(form);
      navigate("/login");
    } catch (err) {
      setError(err?.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md flex flex-col gap-6"
      >
        <h2 className="text-2xl font-bold text-center text-[#e25a5a]">
          Sign Up
        </h2>
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded">
            {error}
          </div>
        )}
        <input
          type="text"
          name="fullname"
          placeholder="Full Name"
          className="border rounded px-4 py-2"
          value={form.fullname}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="username"
          placeholder="Username"
          className="border rounded px-4 py-2"
          value={form.username}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="border rounded px-4 py-2"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="border rounded px-4 py-2"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button
          type="submit"
          className="bg-[#e25a5a] text-white py-2 rounded font-bold hover:bg-[#b13b3b] transition"
          disabled={loading}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
        <p className="text-center text-sm">
          Already have an account?{" "}
          <span
            className="text-[#e25a5a] cursor-pointer underline"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
};

export default Signup;
