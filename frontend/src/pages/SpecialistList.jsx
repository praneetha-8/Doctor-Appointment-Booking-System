import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { AlertCircle, ArrowLeft, Calendar, CheckCircle } from "lucide-react";

const API_BASE_URL = "http://localhost:5000";

const SpecialistList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { patientId, specialistName, specialistField } = location.state || {};

  const [patientName, setPatientName] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  console.log("🔹 Component Mounted: SpecialistList");
  console.log("🔹 Location State:", location.state);

  // 🔍 Fetch Patient Name using Patient ID
  useEffect(() => {
    if (patientId) {
      axios
        .get(`${API_BASE_URL}/api/patients/${patientId}`)
        .then((response) => {
          console.log("✅ Patient Details Fetched:", response.data);
          setPatientName(response.data.name); // Assuming response contains { name: "John Doe" }
        })
        .catch((error) => {
          console.error("❌ Error fetching patient details:", error);
          setError("Failed to load patient details.");
        });
    }
  }, [patientId]);

  // 🔍 Fetch Specialist Doctors
  useEffect(() => {
    if (specialistField) {
      console.log(`📢 Fetching doctors for specialization: ${specialistField}`);
      axios
        .get(`${API_BASE_URL}/api/patients/specialist_list?specialization=${specialistField}`)
        .then((response) => {
          console.log("✅ Doctors Fetched Successfully:", response.data);
          setDoctors(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("❌ Error fetching doctors:", error);
          setError(error.response?.status === 404 
            ? `No doctors available for ${specialistName}.` 
            : "Failed to fetch doctors. Please try again later.");
          setLoading(false);
        });
    }
  }, [specialistField]);

  // 📅 Book Appointment
  const bookDoctor = (doctor) => {
    const appointmentData = {
      patient_id: patientId,  
      doctor_name: doctor.name,  
      patient_name: patientName,  // ✅ Use fetched patient name
      specialization: specialistField,  
      appointment_date: selectedDate,  
      time_slot: doctor.time_slot,  
      status: "Confirmed",
    };

    axios
      .post(`${API_BASE_URL}/api/appointments/book`, appointmentData)
      .then((response) => {
        console.log("✅ Appointment Booked Successfully:", response.data);
        navigate("/patient-dashboard/specialist/booking-confirmed", { 
          state: { patientId, patientName, doctor, selectedDate } 
        });
      })
      .catch((error) => {
        console.error("❌ Error booking appointment:", error);
        setError(error.response?.data?.error || "Failed to book the appointment.");
      });
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
          <button className="mt-4 flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2" /> Go Back
          </button>
        </div>
      ) : (
        <>
          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 bg-green-100 text-green-700 p-4 rounded-lg flex items-center">
              <CheckCircle className="mr-2" /> {successMessage}
            </div>
          )}

          {/* Date Picker */}
          <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
            <label className="block text-lg font-medium mb-2 flex items-center">
              <Calendar className="mr-2" /> Select Appointment Date:
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                console.log("📅 Selected Date:", e.target.value);
                setSelectedDate(e.target.value);
              }}
              className="p-3 border rounded-lg w-full"
            />
          </div>

          {/* Doctors List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <div key={doctor._id} className="bg-white p-6 rounded-lg shadow flex flex-col items-center">
                <h3 className="text-xl font-semibold">{doctor.name}</h3>

                {/* Time Slot Section */}
                <div className="mt-3 w-full">
                  <p className="text-gray-500 text-lg font-medium">Available Time Slot:</p>
                  {doctor.time_slot ? (
                    <div className="bg-gray-100 p-3 rounded-lg shadow-md mt-2 text-center">
                      <span className="bg-green-500 text-white px-4 py-2 rounded text-lg font-semibold">
                        {doctor.time_slot}
                      </span>
                    </div>
                  ) : (
                    <p className="text-red-500 mt-2">No available time slot</p>
                  )}
                </div>

                {/* Book Appointment Button */}
                <button
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  onClick={() => bookDoctor(doctor)}
                  disabled={!selectedDate}
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
