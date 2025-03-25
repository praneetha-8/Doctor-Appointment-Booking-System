import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns"; // For formatting dates

const API_BASE_URL = "http://localhost:5000"; // Change this to your API URL

const PatientAppointments = ({ patientId }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!patientId) {
      setError("Invalid patient ID");
      setLoading(false);
      return;
    }

    const fetchAppointments = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/appointments/${patientId}`);
        console.log("🟢 API Response Data:", response.data); // Debugging
        setAppointments(response.data);
      } catch (err) {
        console.error("🔴 API Fetch Error:", err);
        setError(err.response?.data?.message || "Failed to load appointments");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [patientId]);

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-red-500 text-center py-10">{error}</div>;

  // Categorize appointments
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time for accurate date comparison

  const upcomingAppointments = appointments.filter((app) => {
    const appDate = new Date(app.appointment_date);
    return appDate >= today;
  });

  const previousAppointments = appointments.filter((app) => {
    const appDate = new Date(app.appointment_date);
    return appDate < today;
  });

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6">My Appointments</h1>

      {/* Upcoming Appointments */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-blue-600">Upcoming Appointments</h2>
        {upcomingAppointments.length > 0 ? (
          <ul className="space-y-4">
            {upcomingAppointments.map((app) => (
              <li key={app._id} className="bg-white p-4 rounded-lg shadow-md">
                <p className="text-lg font-semibold">{app.doctor_name} ({app.specialization})</p>
                <p className="text-gray-600">
                  {format(new Date(app.appointment_date), "PPpp")} - {app.time_slot}
                </p>
                <p className={`text-sm font-medium ${app.status === "Confirmed" ? "text-green-600" : "text-red-600"}`}>
                  {app.status}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No upcoming appointments.</p>
        )}
      </div>

      {/* Previous Appointments */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Previous Appointments</h2>
        {previousAppointments.length > 0 ? (
          <ul className="space-y-4">
            {previousAppointments.map((app) => (
              <li key={app._id} className="bg-white p-4 rounded-lg shadow-md">
                <p className="text-lg font-semibold">{app.doctor_name} ({app.specialization})</p>
                <p className="text-gray-600">
                  {format(new Date(app.appointment_date), "PPpp")} - {app.time_slot}
                </p>
                <p className={`text-sm font-medium ${app.status === "Confirmed" ? "text-green-600" : "text-red-600"}`}>
                  {app.status}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No previous appointments.</p>
        )}
      </div>
    </div>
  );
};

export default PatientAppointments;
