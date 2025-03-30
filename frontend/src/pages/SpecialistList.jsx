import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { AlertCircle, ArrowLeft, Calendar, CheckCircle } from "lucide-react";

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

  const bookDoctor = (doctor) => {
    if (!selectedDate || !doctor.time_slot) {
      alert("Please select a valid date and ensure the doctor has available slots.");
      return;
    }

    const appointmentData = {
      patient_id: patientId,
      doctor_name: doctor.name,
      patient_name: patientName,
      specialization: specialistField,
      appointment_date: selectedDate,
      time_slot: doctor.time_slot,
      status: "Confirmed",
    };

    console.log("Sending Appointment Data:", appointmentData);

    axiosInstance
      .post(`/api/appointments/book`, appointmentData)
      .then(() =>
        navigate("/patient-dashboard/specialist/booking-confirmed", {
          state: { 
            patientId, 
            patientName, 
            doctor, 
            selectedDate, 
            timeSlot: doctor.time_slot, // Fixed key name
            specialization: specialistField 
          },
        })
      )
      .catch((err) =>
        setError(err.response?.data?.error || "Failed to book the appointment.")
      );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">Available {specialistName}s</h1>

      {loading ? (
        <p className="text-gray-500">Loading doctors...</p>
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
          <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
            <label className="block text-lg font-medium mb-2 flex items-center">
              <Calendar className="mr-2" /> Select Appointment Date:
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="p-3 border rounded-lg w-full"
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <div
                key={doctor._id}
                className="bg-white p-6 rounded-lg shadow flex flex-col items-center"
              >
                <h3 className="text-xl font-semibold">{doctor.name}</h3>
                <p className="text-gray-500">Specialization: {doctor.specialization}</p>
                <p className="text-gray-500">Time Slot: {doctor.time_slot || "N/A"}</p>
                <button
                  className={`mt-4 text-white px-4 py-2 rounded ${
                    doctor.time_slot
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                  onClick={() => bookDoctor(doctor)}
                  disabled={!doctor.time_slot || !selectedDate}
                >
                  Book Appointment
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SpecialistList;
