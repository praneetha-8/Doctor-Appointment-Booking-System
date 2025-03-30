import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Home, Calendar, User, MessageCircle, LogOut } from "lucide-react";
import Profile from "./PatientProfile";
import Logout from "./PatientLogout";
import Homepagepatient from "./homepagepatient";
import PatientAppointments from "./PatientAppointments";

const API_BASE_URL = "http://localhost:5000";

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const fetchPatientData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/patient-login"); // Redirect to login if not authenticated
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/api/patients/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPatient(response.data);
      } catch (err) {
        console.error("🔴 Error fetching patient data:", err.response?.data || err.message);
        
        if (err.response?.status === 401) {
          console.warn("⚠️ Unauthorized! Redirecting to login...");
          localStorage.removeItem("token");
          navigate("/patient-login");
        } else {
          setError("Failed to load patient data. Please try again.");
        }
      } finally {
        setLoading(false);
      }
      
    };

    fetchPatientData();
  }, [navigate]);

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-red-500 text-center py-10">{error}</div>;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-blue-600 text-white p-6">
        <div className="text-xl font-bold mb-6">Medico</div>
        <nav className="space-y-4">
          <button
            onClick={() => setActiveSection("home")}
            className={`flex items-center w-full p-3 rounded ${
              activeSection === "home" ? "bg-blue-700" : "hover:bg-blue-500"
            }`}
          >
            <Home className="mr-3" /> Home
          </button>
          <button
            onClick={() => setActiveSection("appointments")}
            className={`flex items-center w-full p-3 rounded ${
              activeSection === "appointments" ? "bg-blue-700" : "hover:bg-blue-500"
            }`}
          >
            <Calendar className="mr-3" /> Appointments
          </button>
          <button
            onClick={() => setActiveSection("profile")}
            className={`flex items-center w-full p-3 rounded ${
              activeSection === "profile" ? "bg-blue-700" : "hover:bg-blue-500"
            }`}
          >
            <User className="mr-3" /> Profile
          </button>
          <button
            onClick={() => setActiveSection("logout")}
            className="flex items-center w-full p-3 rounded hover:bg-red-500"
          >
            <LogOut className="mr-3" /> Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-100 p-8">
        {activeSection === "home" && (
          <div>
            <h1 className="text-3xl font-bold mb-6">Welcome, {patient?.name}</h1>
            <div className="mt-8">
              <Homepagepatient patientId={patient?._id} />
            </div>
          </div>
        )}

        {activeSection === "appointments" && <PatientAppointments patientId={patient?._id} />}
        {activeSection === "profile" && <Profile patient={patient} />}
        {activeSection === "logout" && <Logout />}
      </div>

      {/* Chatbot Button */}
      <button className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700">
        <MessageCircle size={24} />
      </button>
    </div>
  );
};

export default PatientDashboard;
