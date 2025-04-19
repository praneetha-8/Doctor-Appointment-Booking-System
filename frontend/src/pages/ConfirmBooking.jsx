import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, Home, Calendar, Clock, User, Stethoscope } from "lucide-react";
import jwtDecode from "jwt-decode";

const BookingConfirmed = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    patientName = "Unknown",
    doctor = {},
    selectedDate = "N/A",
    timeSlot = "N/A",
    specialization = "N/A"
  } = location.state || {};

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

      // ✅ Send confirmation email after booking
      sendConfirmationEmail();
    } catch (error) {
      console.error("Invalid token", error);
      return redirectToLogin();
    }
  }, [navigate]);

  const formatDate = (dateString) => {
    try {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
      return dateString;
    }
  };

  const sendConfirmationEmail = async () => {
    try {
      const patientData = localStorage.getItem("patient");
      const parsedPatient = patientData ? JSON.parse(patientData) : null;
      const toEmail = parsedPatient?.email || "user@example.com";  // safer parsing

      await fetch("http://localhost:5000/api/email/send-confirmation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientName,
          doctorName: doctor.name || "Unknown",
          specialization: doctor.specialization || specialization,
          selectedDate,
          timeSlot,
          toEmail,
        }),
      });
      console.log("📧 Confirmation email sent to", toEmail);
    } catch (err) {
      console.error("❌ Failed to send confirmation email", err);
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

          
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmed;
