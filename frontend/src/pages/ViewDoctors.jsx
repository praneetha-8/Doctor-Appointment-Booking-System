import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AddDoctorForm from "./AddDoctorForm";
import  jwtDecode  from "jwt-decode";


const DoctorsList = () => {
  const [doctors, setDoctors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    if (!token) {
      alert("Unauthorized access! Please log in.");
      navigate("/admin-login");
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000; // Convert to seconds

      if (decodedToken.exp < currentTime) {
        alert("Session expired. Please log in again.");
        localStorage.removeItem("adminToken");
        navigate("/login");
      } else {
        fetchDoctors(token);
      }
    } catch (error) {
      console.error("Invalid token", error);
      localStorage.removeItem("adminToken");
      navigate("/login");
    }
  }, [navigate]);

  const fetchDoctors = async (token) => {
    try {
      const response = await fetch("http://localhost:5000/api/doctors/viewdoctors", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`, // Include JWT token
          "Content-Type": "application/json",
        },
      });

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