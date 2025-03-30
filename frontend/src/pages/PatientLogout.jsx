import React from 'react';
import { useNavigate } from 'react-router-dom';

const PatientLogout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Optionally, inform the backend about logout (if applicable)
      await fetch("http://localhost:5000/api/patients/logout", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`, // Send token if needed
        },
      });

      // Clear JWT token and session data
      
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      sessionStorage.clear();

      // Redirect to login page
      navigate("/patient-login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold mb-4">Are you sure you want to logout?</h2>
        <button 
          onClick={handleLogout} 
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default PatientLogout;
