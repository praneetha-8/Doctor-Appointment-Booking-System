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
];

const AddDoctorForm = ({ onDoctorAdded, onClose }) => {
  const [newDoctor, setNewDoctor] = useState({
    name: "",
    specialization: "",
    email: "",
    phone: "",
    start_time: "",
    end_time: "",
    time_slot: "", // ✅ Included in state
  });

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        alert("Unauthorized! Please log in.");
        return;
      }

      console.log(newDoctor);

      const response = await fetch("http://localhost:5000/api/doctors/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(newDoctor), // ✅ No need to manually add `time_slot`
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
          <input
            type="text"
            placeholder="Phone"
            value={newDoctor.phone}
            onChange={(e) => setNewDoctor({ ...newDoctor, phone: e.target.value })}
            required
            className="border p-2 w-full mb-2"
          />

          <label className="block text-gray-700 text-sm font-bold mb-1">Start Time</label>
          <input
            type="time"
            value={newDoctor.start_time}
            onChange={(e) => {
              const start_time = e.target.value;
              setNewDoctor({ 
                ...newDoctor, 
                start_time, 
                time_slot: `${start_time} - ${newDoctor.end_time}` // ✅ Updates `time_slot`
              });
            }}
            required
            className="border p-2 w-full mb-2"
          />

          <label className="block text-gray-700 text-sm font-bold mb-1">End Time</label>
          <input
            type="time"
            value={newDoctor.end_time}
            onChange={(e) => {
              const end_time = e.target.value;
              setNewDoctor({ 
                ...newDoctor, 
                end_time, 
                time_slot: `${newDoctor.start_time} - ${end_time}` // ✅ Updates `time_slot`
              });
            }}
            required
            className="border p-2 w-full mb-2"
          />

          <div className="flex justify-between">
            <button className="bg-green-500 text-white px-4 py-2 rounded" type="submit">
              Save Doctor
            </button>
            <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDoctorForm;
