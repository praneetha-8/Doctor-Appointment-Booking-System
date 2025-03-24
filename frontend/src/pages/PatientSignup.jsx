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
    if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = "Invalid phone number";
    if (!formData.password || formData.password.length < 8)
      newErrors.password = "Password must be 8+ characters";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.dob) newErrors.dob = "Date of Birth is required";

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
          age: parseInt(formData.age), // Ensure age is a number
          medical_history: Array.isArray(formData.medical_history)
            ? formData.medical_history.flat().filter(item => item.trim() !== '') // Flatten and remove empty values
            : formData.medical_history.split(",").map(item => item.trim()).filter(item => item !== ''), // Convert string to array and remove empty values
        }),
        
      });
  
      const result = await response.json();
      if (response.ok) {
        alert("Signup Successful! Redirecting...");
        navigate("/patient-dashboard", { state: { patientId: result.patient._id } });
      } else {
        setError(result.message || "Signup failed. Try again.");
      }
    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="max-w-lg mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Patient Signup</h2>
      {error && <p className="text-red-500">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-3">
        {["name", "email", "phone", "address"].map((field) => (
          <input key={field} type="text" name={field} placeholder={field} value={formData[field]}
            onChange={handleChange} className="w-full p-2 border rounded" required />
        ))}

        <input type="number" name="age" placeholder="Age" value={formData.age}
        onChange={handleChange} className="w-full p-2 border rounded" required />

        <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-2 border rounded" required>
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full p-2 border rounded" required />

        {["password", "confirmPassword"].map((field) => (
          <input key={field} type="password" name={field} placeholder={field} value={formData[field]}
            onChange={handleChange} className="w-full p-2 border rounded" required />
        ))}

        <input type="text" name="medical_history" placeholder="Medical History (optional)" value={formData.medical_history}
          onChange={handleChange} className="w-full p-2 border rounded" />

        <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white p-2 rounded">
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
};

export default PatientSignup;
