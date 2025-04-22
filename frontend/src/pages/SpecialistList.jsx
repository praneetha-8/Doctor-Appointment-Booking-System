import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { AlertCircle, ArrowLeft, Calendar, CheckCircle, Clock } from "lucide-react";

const API_BASE_URL = "http://localhost:5000";

const SpecialistList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { specialistName, specialistField } = location.state || {};
  const token = localStorage.getItem("token");

  const patientString = localStorage.getItem("patient");
  const patient = patientString ? JSON.parse(patientString) : null;
  const patientId = patient?._id;
  const patientName = patient?.name || "Unknown";

  // Handle session expiration
  useEffect(() => {
    if (!token || !patientId || !patient) {
      alert("Session expired. Please log in again.");
      localStorage.clear();
      navigate("/login");
      return;
    }
  }, [token, patientId, patient, navigate]);

  const [doctors, setDoctors] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSlots, setSelectedSlots] = useState({});
  const [bookingInProgress, setBookingInProgress] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
  }, [token, navigate]);

  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
  });

  useEffect(() => {
    if (specialistField) {
      axiosInstance
        .get(`/api/patients/specialist_list?specialization=${specialistField}`)
        .then((response) => {
          setDoctors(response.data);
          setLoading(false);
        })
        .catch((err) => {
          setError(
            err.response?.status === 404
              ? `No doctors available for ${specialistName}.`
              : "Failed to fetch doctors."
          );
          setLoading(false);
        });
    }
  }, [specialistField]);

  // Handle time slot selection for a doctor
  const handleSelectTimeSlot = (doctorId, timeSlot) => {
    setSelectedSlots({
      ...selectedSlots,
      [doctorId]: timeSlot
    });
  };

  // Get available time slots for a doctor based on the selected date
  const getAvailableTimeSlots = (doctor) => {
    if (!doctor.time_slots || !Array.isArray(doctor.time_slots)) return [];
  
    const today = new Date();
    const selected = new Date(selectedDate);
  
    // Don't show any slots if selected date is in the past
    if (selected < new Date(today.toDateString())) return [];
  
    const timeSlotForDate = doctor.time_slots.find(
      (slot) => slot.date === selectedDate
    );
  
    if (!timeSlotForDate || !timeSlotForDate.slots) return [];
  
    return timeSlotForDate.slots
      .filter((slot) => {
        if (slot.status !== 'free') return false;
  
        // If the selected date is today, remove past time slots
        if (selected.toDateString() === today.toDateString()) {
          // Extract just the start time (assuming format like "17:00 - 17:15")
          const startTime = slot.time.split(" - ")[0];
          const [hour, minute] = startTime.split(":").map(Number);
          
          const slotDateTime = new Date(selected);
          slotDateTime.setHours(hour, minute, 0, 0);
  
          return slotDateTime > today;
        }
  
        return true;
      })
      .map((slot) => slot.time);
  };
  

  const bookDoctor = (doctor) => {
    const selectedTimeSlot = selectedSlots[doctor._id];
    
    if (!selectedDate || !selectedTimeSlot) {
      alert("Please select a valid date and time slot.");
      return;
    }

    setBookingInProgress(true);
    setError(null);

    const appointmentData = {
      patient_id: patientId,
      doctor_id: doctor._id, 
      doctor_name: doctor.name,
      patient_name: patientName,
      specialization: specialistField,
      appointment_date: selectedDate,
      time_slot: selectedTimeSlot,
      status: "Confirmed",
    };

    console.log("Sending Appointment Data:", appointmentData);

    axiosInstance
      .post(`/api/appointments/book`, appointmentData)
      .then((response) => {
        console.log("Booking successful:", response.data);
        navigate("/patient-dashboard/specialist/booking-confirmed", {
          state: { 
            patientId, 
            patientName, 
            doctor, 
            selectedDate, 
            timeSlot: selectedTimeSlot,
            status:"Confirmed",
            specialization: specialistField 
          },
        });
      })
      .catch((err) => {
        console.error("Booking error:", err.response?.data || err.message);
        setError(err.response?.data?.error || "Failed to book the appointment.");
        setBookingInProgress(false);
      });
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
      <div className="w-full max-w-6xl">
        <div className="mb-8 flex items-center">
          <button
            className="mr-4 flex items-center text-blue-600 hover:text-blue-800"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-1" size={18} /> Back
          </button>
          <h1 className="text-3xl font-bold">Available {specialistName}s</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-pulse text-gray-500">Loading doctors...</div>
          </div>
        ) : error ? (
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
            <AlertCircle className="text-red-500 w-12 h-12 mb-4" />
            <p className="text-red-500 text-lg">{error}</p>
            <button
              className="mt-4 flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="mr-2" /> Go Back
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 bg-white p-4 rounded-lg shadow-md w-full">
              <label className="block text-lg font-medium mb-2 flex items-center">
                <Calendar className="mr-2" size={20} /> Select Appointment Date:
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedSlots({}); 
                }}
                className="p-3 border rounded-lg w-full"
                min={new Date().toISOString().split("T")[0]}
              />
              <p className="mt-2 text-sm text-gray-500">
                Showing available appointments for {formatDate(selectedDate)}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {doctors.length === 0 ? (
                <div className="col-span-full text-center py-6 bg-white rounded-lg shadow">
                  <p className="text-gray-500">No {specialistName}s available for the selected criteria.</p>
                </div>
              ) : (
                doctors.map((doctor) => {
                  const availableTimeSlots = getAvailableTimeSlots(doctor);
                  const hasTimeSlots = availableTimeSlots.length > 0;
                  
                  return (
                    <div
                      key={doctor._id}
                      className="bg-white p-6 rounded-lg shadow flex flex-col h-full"
                    >
                      <div className="mb-4 pb-3 border-b">
                        <h3 className="text-xl font-semibold">{doctor.name}</h3>
                        <p className="text-gray-600">{doctor.specialization}</p>
                        <p className="text-gray-500 text-sm mt-1">
                          <span className="inline-flex items-center">
                            <span className="mr-1">📞</span> {doctor.phone}
                          </span>
                        </p>
                      </div>
                      
                      <div className="mb-4 flex-grow">
                        <h4 className="font-medium flex items-center mb-3">
                          <Clock className="mr-2 h-5 w-5 text-blue-600" /> Available Time Slots:
                        </h4>
                        
                        {hasTimeSlots ? (
                          <div className="grid grid-cols-2 gap-2">
                            {availableTimeSlots.map((slot) => (
                              <button
                                key={slot}
                                className={`p-2 text-sm rounded-md border transition-colors ${
                                  selectedSlots[doctor._id] === slot
                                    ? "bg-blue-100 border-blue-500 text-blue-700 font-medium"
                                    : "border-gray-300 hover:bg-gray-100"
                                }`}
                                onClick={() => handleSelectTimeSlot(doctor._id, slot)}
                                disabled={bookingInProgress}
                              >
                                {slot}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-gray-500 text-sm italic">
                              No available slots for selected date
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <button
                        className={`mt-auto w-full text-white px-4 py-2 rounded transition-colors ${
                          hasTimeSlots && selectedSlots[doctor._id] && !bookingInProgress
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-gray-400 cursor-not-allowed"
                        }`}
                        onClick={() => bookDoctor(doctor)}
                        disabled={!hasTimeSlots || !selectedSlots[doctor._id] || bookingInProgress}
                      >
                        {bookingInProgress ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </span>
                        ) : hasTimeSlots && selectedSlots[doctor._id] ? (
                          <span className="flex items-center justify-center">
                            <CheckCircle className="mr-2 h-5 w-5" /> Book Appointment
                          </span>
                        ) : (
                          "Book Appointment"
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SpecialistList;