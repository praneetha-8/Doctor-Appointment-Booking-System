import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000"; 

const PatientAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patientId, setPatientId] = useState(null);
  const [patientEmail, setPatientEmail] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

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

          localPatientId = profileRes.data._id;
          setPatientEmail(profileRes.data.email); 
          localStorage.setItem("patient", JSON.stringify(profileRes.data));
        }
        if (storedPatient) {
          const patientObj = JSON.parse(storedPatient);
          localPatientId = patientObj._id;
          setPatientEmail(patientObj.email); // ⬅️ Set email from localStorage
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

  // Handle cancel appointment
  const handleCancel = (appointment) => {
    setAppointmentToCancel(appointment);
    setShowConfirmation(true);
  };

  // Confirm appointment cancellation

  const confirmCancelAppointment = async () => {
    if (!appointmentToCancel) return;
  
    setCancelLoading(true);
    try {
      const token = localStorage.getItem("token");
  
      // Call unified cancellation endpoint (updates both appointment + doctor DB)
      const cancelRes = await axios.put(
        `${API_BASE_URL}/api/appointments/${appointmentToCancel._id}/cancel`,
        { doctorId: appointmentToCancel.doctor_id }, // Send doctorId too
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      console.log("✅ Cancellation response:", cancelRes.data);
  
      // Send cancellation email
      await axios.post(`${API_BASE_URL}/api/email/send-cancellation`, {
        patientName: appointmentToCancel.patient_name,
        doctorName: appointmentToCancel.doctor_name || "Unknown",
        specialization: appointmentToCancel.specialization || "N/A",
        selectedDate: appointmentToCancel.appointment_date,
        timeSlot: appointmentToCancel.time_slot,
        toEmail: patientEmail,
      });
  
      // Update local appointment state
      setAppointments(
        appointments.map((app) =>
          app._id === appointmentToCancel._id
            ? { ...app, status: "Cancelled" }
            : app
        )
      );
  
      setShowConfirmation(false);
      setAppointmentToCancel(null);
    } catch (err) {
      console.error("❌ Error cancelling appointment:", err);
      alert("Failed to cancel appointment. Please try again.");
    } finally {
      setCancelLoading(false);
    }
  };
  
  

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



  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6">My Appointments</h1>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Cancel Appointment</h3>
            <p className="mb-4">
              Are you sure you want to cancel your appointment with Dr. {appointmentToCancel?.doctor_name} on{" "}
              {format(new Date(appointmentToCancel?.appointment_date), "MMM d, yyyy")}
              {appointmentToCancel?.time_slot && `, ${appointmentToCancel.time_slot}`}?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                disabled={cancelLoading}
              >
                No, Keep It
              </button>
              <button
                onClick={confirmCancelAppointment}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                disabled={cancelLoading}
              >
                {cancelLoading ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

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
                <div className="flex justify-between items-center mt-2">
                  <p className={`text-sm font-medium ${app.status === "Confirmed" ? "text-green-600" : "text-red-600"}`}>
                    {app.status}
                  </p>
                  {app.status === "Confirmed" && (
                    <button
                      onClick={() => handleCancel(app)}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                    >
                      Cancel Appointment
                    </button>
                  )}
                </div>
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