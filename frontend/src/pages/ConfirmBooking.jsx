import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, Home } from "lucide-react";

const BookingConfirmed = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { patientName, doctor, selectedDate } = location.state || {};

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <CheckCircle className="text-green-500 w-16 h-16 mb-4" />
        <h1 className="text-3xl font-bold text-green-600">Booking Confirmed!</h1>
        <p className="text-gray-600 mt-2">Your appointment has been successfully booked.</p>

        {/* Booking Details */}
        <div className="mt-6 bg-gray-100 p-4 rounded-lg shadow">
          <p className="text-lg font-semibold">Patient Name: <span className="font-normal">{patientName}</span></p>
          <p className="text-lg font-semibold">Doctor: <span className="font-normal">{doctor.name}</span></p>
          <p className="text-lg font-semibold">Specialization: <span className="font-normal">{doctor.specialization}</span></p>
          <p className="text-lg font-semibold">Appointment Date: <span className="font-normal">{selectedDate}</span></p>
          <p className="text-lg font-semibold">Time Slot: 
            <span className="font-normal"> {doctor.time_slot || "Not Available"}</span>
          </p>
        </div>

        {/* Button to navigate back to home */}
        <button
          className="mt-6 bg-blue-600 text-white px-4 py-2 rounded flex items-center hover:bg-blue-700"
          onClick={() => navigate("/")}
        >
          <Home className="mr-2" /> Go to Home
        </button>
      </div>
    </div>
  );
};

export default BookingConfirmed;
