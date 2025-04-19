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
  const [isChatOpen, setIsChatOpen] = useState(false); // Chat toggle
  const [messages, setMessages] = useState([]); // Store messages
  const [userMessage, setUserMessage] = useState(""); // User's message

  useEffect(() => {
    const fetchPatientData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/patient-login");
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

  // const handleSendMessage = async () => {
  //   if (!userMessage.trim()) return;

  //   // Add user's message to the state
  //   setMessages((prevMessages) => [
  //     ...prevMessages,
  //     { sender: "user", text: userMessage },
  //   ]);

  //   try {
  //     const response = await axios.post(`${API_BASE_URL}/api/chatbot/message`, { message: userMessage });

  //     // Add chatbot response to the messages state
  //     setMessages((prevMessages) => [
  //       ...prevMessages,
  //       { sender: "chatbot", text: response.data.message },
  //     ]);

  //     // Clear the input field
  //     setUserMessage("");
  //   } catch (err) {
  //     console.error("Error sending message:", err);
  //   }
  // };
  const handleSendMessage = async () => {
    if (!userMessage.trim()) return;

    // Add the user's message to the state
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: "user", text: userMessage },
    ]);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/chatbot/message`, { message: userMessage });

      // Add chatbot response to the messages state
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "chatbot", text: response.data.message },
      ]);

      // Clear the input field
      setUserMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
};


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
      <div className="flex-1 bg-gray-100 p-8 relative">
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

        {/* Chatbot UI */}
        {isChatOpen && (
          <div className="fixed bottom-20 right-6 w-80 h-96 bg-white rounded-xl shadow-xl p-4 flex flex-col z-50">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Chatbot</h2>
              <button onClick={() => setIsChatOpen(false)} className="text-gray-500 hover:text-black text-lg">✖</button>
            </div>
            <div className="flex-1 overflow-y-auto bg-gray-100 p-3 rounded mb-2">
              {messages.map((msg, index) => (
                <div key={index} className={`mb-2 ${msg.sender === "chatbot" ? "text-blue-500" : "text-gray-700"}`}>
                  <p className="text-sm">{msg.text}</p>
                </div>
              ))}
            </div>
            <div>
              <input
                type="text"
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                placeholder="Type your message..."
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none"
              />
              <button
                onClick={handleSendMessage}
                className="w-full bg-blue-600 text-white p-2 rounded mt-2"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Chatbot Button */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 z-50"
      >
        <MessageCircle size={24} />
      </button>
    </div>
  );
};

export default PatientDashboard;
