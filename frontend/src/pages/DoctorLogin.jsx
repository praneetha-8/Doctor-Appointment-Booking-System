import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const DoctorLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("http://localhost:5000/api/doctors/login", {
        email,
        password,
      });

      const { token, doctor } = response.data;
      console.log("Backend Response:", response.data);
      console.log("Stored doctorId:", doctor._id);

      // Store token in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("doctorId", doctor._id);

      // Redirect after successful login
      navigate("/doctor-dashboard", { state: { doctorId: doctor._id } });
    } catch (error) {
      setError(error.response?.data?.message || "Login failed. Try again.");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="absolute top-4 left-4">
      <button
        onClick={() => navigate("/")}
        className="py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md shadow"
      >
        ⬅ Back to Home
      </button>
      </div>
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Doctor Login</h2>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white rounded-md">
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
};

export default DoctorLogin;
