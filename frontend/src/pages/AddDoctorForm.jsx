import React, { useState } from "react";

const AddDoctorForm = ({ onDoctorAdded, onClose }) => {
  const [newDoctor, setNewDoctor] = useState({
    name: "",
    specialization: "",
    email: "",
    phone: "",
    availability: { days: "", slots: "" },
  });

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/doctors/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDoctor),
      });

      if (!response.ok) throw new Error("Failed to add doctor");

      const savedDoctor = await response.json(); // Get newly added doctor from response

      alert("Doctor added successfully!");
      onDoctorAdded(savedDoctor); // Send new doctor data to parent component
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
          <input
            type="text"
            placeholder="Specialization"
            value={newDoctor.specialization}
            onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
            required
            className="border p-2 w-full mb-2"
          />
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
          <input
            type="text"
            placeholder="Available Days (e.g., Monday, Wednesday)"
            value={newDoctor.availability.days}
            onChange={(e) =>
              setNewDoctor({
                ...newDoctor,
                availability: { ...newDoctor.availability, days: e.target.value },
              })
            }
            className="border p-2 w-full mb-2"
          />
          <input
            type="text"
            placeholder="Available Slots (e.g., 10AM-12PM)"
            value={newDoctor.availability.slots}
            onChange={(e) =>
              setNewDoctor({
                ...newDoctor,
                availability: { ...newDoctor.availability, slots: e.target.value },
              })
            }
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
