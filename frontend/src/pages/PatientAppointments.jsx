import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns"; // For formatting dates

const API_BASE_URL = "http://localhost:5000"; // Change this to your API URL

const PatientAppointments = ({ patientId }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/appointments/${patientId}`);
        setAppointments(response.data);
      } catch (err) {
        setError("Failed to load appointments");
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
  const upcomingAppointments = appointments.filter(app => new Date(app.date) >= today);
  const previousAppointments = appointments.filter(app => new Date(app.date) < today);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6">My Appointments</h1>

      {/* Upcoming Appointments */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-blue-600">Upcoming Appointments</h2>
        {upcomingAppointments.length > 0 ? (
          <ul className="space-y-4">
            {upcomingAppointments.map((app) => (
              <li key={app.id} className="bg-white p-4 rounded-lg shadow-md">
                <p className="text-lg font-semibold">{app.specialist}</p>
                <p className="text-gray-600">{format(new Date(app.date), "PPpp")}</p>
                <p className="text-gray-500">{app.status}</p>
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
              <li key={app.id} className="bg-white p-4 rounded-lg shadow-md">
                <p className="text-lg font-semibold">{app.specialist}</p>
                <p className="text-gray-600">{format(new Date(app.date), "PPpp")}</p>
                <p className="text-gray-500">{app.status}</p>
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
