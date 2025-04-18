import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, Home, Calendar, Clock, User, Stethoscope } from "lucide-react";
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
    localStorage.clear();
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

  // Format the date to be more readable
  const formatDate = (dateString) => {
    try {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-4 rounded-full">
            <CheckCircle className="text-green-500 w-12 h-12" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-green-600 mb-2">Booking Confirmed!</h1>
        <p className="text-gray-600 mb-6">Your appointment has been successfully scheduled.</p>
        
        <div className="bg-gray-50 p-6 rounded-lg shadow-inner mb-6">
          <div className="flex items-start mb-4">
            <User className="text-blue-500 mr-3 mt-1 flex-shrink-0" size={18} />
            <div>
              <p className="text-gray-500 text-sm">Patient</p>
              <p className="font-medium">{patientName}</p>
            </div>
          </div>
          
          <div className="flex items-start mb-4">
            <Stethoscope className="text-blue-500 mr-3 mt-1 flex-shrink-0" size={18} />
            <div>
              <p className="text-gray-500 text-sm">Doctor</p>
              <p className="font-medium">{doctor.name || "Unknown"}</p>
              <p className="text-sm text-gray-600">{doctor.specialization || specialization}</p>
            </div>
          </div>
          
          <div className="flex items-start mb-4">
            <Calendar className="text-blue-500 mr-3 mt-1 flex-shrink-0" size={18} />
            <div>
              <p className="text-gray-500 text-sm">Appointment Date</p>
              <p className="font-medium">{formatDate(selectedDate)}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <Clock className="text-blue-500 mr-3 mt-1 flex-shrink-0" size={18} />
            <div>
              <p className="text-gray-500 text-sm">Appointment Time</p>
              <p className="font-medium">{timeSlot}</p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center space-x-4">
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition-colors flex items-center"
            onClick={() => navigate("/patient-dashboard")}
          >
            <Home className="mr-2" size={18} /> Dashboard
          </button>
          
          <button 
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2 rounded-lg transition-colors"
            onClick={() => navigate("/patient-dashboard/appointments")}
          >
            View Appointments
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmed;