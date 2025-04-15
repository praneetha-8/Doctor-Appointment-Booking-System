import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const PatientSignup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    gender: "",
    dob: "",
    address: "",
    password: "",
    confirmPassword: "",
    medical_history: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Full Name is required";
    if (!formData.email.includes("@")) newErrors.email = "Invalid email address";
    if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = "Phone number must be 10 digits";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.age || formData.age <= 0) newErrors.age = "Valid age is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.dob) newErrors.dob = "Date of Birth is required";
    if (!formData.password || formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters long";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setErrors({});

    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/patients/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          age: parseInt(formData.age),
          medical_history: Array.isArray(formData.medical_history)
            ? formData.medical_history.flat().filter(item => item.trim() !== '')
            : formData.medical_history.split(",").map(item => item.trim()).filter(item => item !== ''),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Signup Successful!");
        localStorage.setItem("token", result.token);
        localStorage.setItem("patient", JSON.stringify(result.patient));
        navigate("/patient-dashboard", { state: { patientId: result.patient._id } });
      } else {
        setError(result.message || "Signup failed. Try again.");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Patient Signup</h2>
      {error && <p className="text-red-600 font-semibold">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange}
            className="w-full p-2 border rounded" />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>

        {/* Email */}
        <div>
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange}
            className="w-full p-2 border rounded" />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
        </div>

        {/* Phone */}
        <div>
          <input type="text" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange}
            className="w-full p-2 border rounded" />
          {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
        </div>

        {/* Address */}
        <div>
          <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange}
            className="w-full p-2 border rounded" />
          {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
        </div>

        {/* Age */}
        <div>
          <input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleChange}
            className="w-full p-2 border rounded" />
          {errors.age && <p className="text-red-500 text-sm">{errors.age}</p>}
        </div>

        {/* Gender */}
        <div>
          <select name="gender" value={formData.gender} onChange={handleChange}
            className="w-full p-2 border rounded">
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          {errors.gender && <p className="text-red-500 text-sm">{errors.gender}</p>}
        </div>

        {/* DOB */}
        <div>
          <input type="date" name="dob" value={formData.dob} onChange={handleChange}
            className="w-full p-2 border rounded" />
          {errors.dob && <p className="text-red-500 text-sm">{errors.dob}</p>}
        </div>

        {/* Password */}
        <div>
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange}
            className="w-full p-2 border rounded" />
          {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
        </div>

        {/* Confirm Password */}
        <div>
          <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword}
            onChange={handleChange} className="w-full p-2 border rounded" />
          {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
        </div>

        {/* Medical History (Optional) */}
        <div>
          <input type="text" name="medical_history" placeholder="Medical History (comma-separated)" value={formData.medical_history}
            onChange={handleChange} className="w-full p-2 border rounded" />
        </div>

        <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white p-2 rounded">
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
};

export default PatientSignup;
