import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, Home } from "lucide-react";
import jwtDecode from "jwt-decode";

const BookingConfirmed = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extracting data passed from the previous page
  const { 
    patientName = "Unknown", 
    doctor = {}, 
    selectedDate = "N/A", 
    timeSlot = "N/A", 
    specialization = "N/A" 
  } = location.state || {};

  // Function to handle session expiration
  const redirectToLogin = () => {
    alert("Session expired. Please log in again.");
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return redirectToLogin();

    try {
      const decodedToken = jwtDecode(token);
      if (decodedToken.exp < Date.now() / 1000) return redirectToLogin();
    } catch (error) {
      console.error("Invalid token", error);
      return redirectToLogin();
    }
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <CheckCircle className="text-green-500 w-16 h-16 mb-4" />
        <h1 className="text-3xl font-bold text-green-600">Booking Confirmed!</h1>
        <p className="text-gray-600 mt-2">Your appointment has been successfully booked.</p>

        <div className="mt-6 bg-gray-100 p-4 rounded-lg shadow">
          <p>Patient: {patientName}</p>
          <p>Doctor: {doctor.name || "Unknown"}</p>
          <p>Specialization: {specialization}</p>
          <p>Date: {selectedDate}</p>
          <p>Time: {timeSlot}</p>
        </div>

        <button className="mt-6 bg-blue-600 text-white px-4 py-2 rounded" onClick={() => navigate("/patient-dashboard")}>
          <Home className="mr-2" /> Go to Home
        </button>
      </div>
    </div>
  );
};

export default BookingConfirmed;
