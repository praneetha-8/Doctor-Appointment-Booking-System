import React, { useState } from "react";

const specializations = [
  "Cardiologist",
  "Dermatologist",
  "Neurologist",
  "Orthopedic Surgeon",
  "Pediatrician",
  "General Physician",
  "Gynecologist",
  "Psychiatrist",
  "Ophthalmologist",
  "Dentist",
  "ENT Specialist"
];

const AddDoctorForm = ({ onDoctorAdded, onClose }) => {
  const [newDoctor, setNewDoctor] = useState({
    name: "",
    specialization: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState({
    phone: ""
  });

  const validatePhone = (phone) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  };

  const handlePhoneChange = (e) => {
    const phone = e.target.value;
    setNewDoctor({ ...newDoctor, phone });
   
    if (phone && !validatePhone(phone)) {
      setErrors({ ...errors, phone: "Phone number must be 10 digits" });
    } else {
      setErrors({ ...errors, phone: "" });
    }
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
   
    // Validate phone number before submission
    if (!validatePhone(newDoctor.phone)) {
      setErrors({ ...errors, phone: "Phone number must be 10 digits" });
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        alert("Unauthorized! Please log in.");
        return;
      }

      const response = await fetch("http://localhost:5000/api/doctors/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ ...newDoctor, time_slots: [] }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add doctor");
      }

      const savedDoctor = await response.json();
      alert("Doctor added successfully!");
      onDoctorAdded(savedDoctor);
      onClose();
    } catch (error) {
      console.error("Error adding doctor:", error);
      alert(error.message || "Failed to add doctor");
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Add New Doctor</h2>
        <form onSubmit={handleAddDoctor}>
          <input
            type="text"
            placeholder="Doctor Name"
            value={newDoctor.name}
            onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
            required
            className="border p-2 w-full mb-2"
          />

          <label className="block text-gray-700 text-sm font-bold mb-1">Specialization</label>
          <select
            value={newDoctor.specialization}
            onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
            required
            className="border p-2 w-full mb-2"
          >
            <option value="" disabled>Select Specialization</option>
            {specializations.map((spec, index) => (
              <option key={index} value={spec}>{spec}</option>
            ))}
          </select>

          <input
            type="email"
            placeholder="Email"
            value={newDoctor.email}
            onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
            required
            className="border p-2 w-full mb-2"
          />
         
          <div className="mb-2">
            <input
              type="tel"
              placeholder="Phone (10 digits)"
              value={newDoctor.phone}
              onChange={handlePhoneChange}
              required
              className="border p-2 w-full"
              maxLength="10"
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>
         
          <div className="flex justify-between">
            <button
              className={`px-4 py-2 rounded ${
                errors.phone
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600 text-white"
              }`}
              type="submit"
              disabled={!!errors.phone}
            >
              Save Doctor
            </button>
            <button
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );

};


export default AddDoctorForm;