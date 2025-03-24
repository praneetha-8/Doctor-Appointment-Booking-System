import React, { useState, useEffect } from "react";
import AddDoctorForm from "./AddDoctorForm";

const DoctorsList = () => {
  const [doctors, setDoctors] = useState([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/doctors/viewdoctors");
      if (!response.ok) throw new Error("Failed to fetch doctors");
      const data = await response.json();
      setDoctors(data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  // Function to handle adding a new doctor
  const handleDoctorAdded = (newDoctor) => {
    setDoctors((prevDoctors) => [...prevDoctors, newDoctor]); // Update UI immediately
    setShowForm(false); // Close form after adding doctor
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-blue-800">Doctors List</h2>
      <button
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        onClick={() => setShowForm(true)}
      >
        Add Doctor
      </button>

      {showForm && <AddDoctorForm onDoctorAdded={handleDoctorAdded} onClose={() => setShowForm(false)} />}

      <table className="w-full mt-4 border-collapse border border-gray-200">
        <thead>
          <tr className="bg-blue-200 text-blue-800">
            <th className="p-3 border">Name</th>
            <th className="p-3 border">Specialization</th>
            <th className="p-3 border">Email</th>
            <th className="p-3 border">Phone</th>
            <th className="p-3 border">Availability</th>
          </tr>
        </thead>
        <tbody>
          {doctors.length > 0 ? (
            doctors.map((doctor) => (
              <tr key={doctor._id} className="text-center border">
                <td className="p-3 border">{doctor.name}</td>
                <td className="p-3 border">{doctor.specialization}</td>
                <td className="p-3 border">{doctor.email}</td>
                <td className="p-3 border">{doctor.phone}</td>
                <td className="p-3 border">
                  Days: {doctor.availability?.days?.join(", ") || "N/A"} <br />
                  Slots: {doctor.availability?.slots?.join(", ") || "N/A"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="p-3 text-center text-gray-500">
                No doctors available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DoctorsList;
