

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = "http://localhost:5000";

const Appointments = ({ patientId }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noAppointments, setNoAppointments] = useState(false); 

  useEffect(() => {
    console.log("Patient ID received:", patientId);
    const fetchAppointments = async () => {
      try {
        console.log(`Fetching appointments for patient ID: ${patientId}`);
        const response = await axios.get(`${API_BASE_URL}/api/appointments/${encodeURIComponent(patientId)}`);
        console.log("Appointments received:", response.data);
        setAppointments(response.data);
        setNoAppointments(response.data.length === 0);
      } catch (err) {
        console.error("Error fetching appointments:", err);
        if (err.response && err.response.status === 404) {
          setNoAppointments(true); // ✅ Handle 404 as no appointments
        } else {
          setError("Failed to load appointments");
        }
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchAppointments();
    } else {
      setError("No patient ID provided");
      setLoading(false);
    }
  }, [patientId]);

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-red-500 text-center py-10">{error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Appointments</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        {appointments.length > 0 ? (
          <ul>
            {appointments.map((appointment, index) => (
              <li key={index} className="border-b py-2">
                {appointment.doctor_name} - {appointment.appointment_date} at {appointment.time_slot}
              </li>
            ))}
          </ul>
        ) : (
          <p>No appointments available</p>
        )}
      </div>
    </div>
  );
};

export default Appointments;
