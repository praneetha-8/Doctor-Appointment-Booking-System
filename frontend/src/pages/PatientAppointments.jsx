import React, { useState, useEffect } from "react";
import axios from "axios";
import { format, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000"; // Adjust to your backend URL

const PatientAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patientId, setPatientId] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem("token");
        const storedPatient = localStorage.getItem("patient");
        let localPatientId = storedPatient ? JSON.parse(storedPatient)._id : null;

        if (!token) {
          console.warn("🔴 No token found. Redirecting to login...");
          navigate("/patient-login");
          return;
        }

        console.log("🔵 Token Retrieved:", token);

        // If localStorage doesn't have patientId, fetch from profile API
        if (!localPatientId) {
          console.log("🔍 Fetching patient profile...");
          const profileRes = await axios.get(`${API_BASE_URL}/api/patients/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          localPatientId = profileRes.data._id;
          localStorage.setItem("patient", JSON.stringify(profileRes.data));
        }

        setPatientId(localPatientId); // Store in state
        console.log("🟢 Patient ID:", localPatientId);

        // Fetch appointments using stored patientId
        const response = await axios.get(`${API_BASE_URL}/api/appointments/${localPatientId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("🟢 API Response Data:", response.data);
        
        if (response.data.length === 0) {
          setError("No appointments found.");
        } else {
          setAppointments(response.data);
        }

      } catch (err) {
        console.error("🔴 API Fetch Error:", err.response?.data?.message || err.message);
        setError(err.response?.data?.message || "Failed to load appointments. Please log in again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [navigate]);

  if (loading) return <div className="text-center py-10 text-lg font-medium">Loading...</div>;
  if (error) return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h2 className="text-2xl font-bold text-gray-700">{error}</h2>
      <p className="text-gray-500 text-sm mt-2">Please check again later or contact support.</p>
    </div>
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingAppointments = appointments.filter((app) => new Date(app.appointment_date) >= today);
  const previousAppointments = appointments.filter((app) => new Date(app.appointment_date) < today);

  // Format date and time properly
  const formatAppointmentDateTime = (date, timeSlot) => {
    try {
      // Format the date portion
      const formattedDate = format(new Date(date), "MMM d, yyyy");
      
      // Clean up the time slot format (remove any ':00' from times)
      const cleanTimeSlot = timeSlot.replace(/:00-/, "-").replace(/:00$/, "");
      
      return `${formattedDate}, ${cleanTimeSlot}`;
    } catch (err) {
      console.error("Error formatting date:", err);
      return "Invalid date";
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6">My Appointments</h1>

      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-blue-600">Upcoming Appointments</h2>
        {upcomingAppointments.length > 0 ? (
          <ul className="space-y-4">
            {upcomingAppointments.map((app) => (
              <li key={app._id} className="bg-white p-4 rounded-lg shadow-md">
                <p className="text-lg font-semibold">{app.doctor_name} ({app.specialization})</p>
                <p className="text-gray-600">
                  {format(new Date(app.appointment_date), "MMM d, yyyy")}
                  {app.time_slot && `, ${app.time_slot.replace(/5:300/g, "5:30")}`}
                </p>
                <p className={`text-sm font-medium ${app.status === "Confirmed" ? "text-green-600" : "text-red-600"}`}>
                  {app.status}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center">
            <p className="text-gray-500">You have no upcoming appointments.</p>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Previous Appointments</h2>
        {previousAppointments.length > 0 ? (
          <ul className="space-y-4">
            {previousAppointments.map((app) => (
              <li key={app._id} className="bg-white p-4 rounded-lg shadow-md">
                <p className="text-lg font-semibold">{app.doctor_name} ({app.specialization})</p>
                <p className="text-gray-600">
                  {format(new Date(app.appointment_date), "MMM d, yyyy")}
                  {app.time_slot && `, ${app.time_slot.replace(/5:300/g, "5:30")}`}
                </p>
                <p className={`text-sm font-medium ${app.status === "Confirmed" ? "text-green-600" : "text-red-600"}`}>
                  {app.status}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center">
            <p className="text-gray-500">No previous appointments found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientAppointments;