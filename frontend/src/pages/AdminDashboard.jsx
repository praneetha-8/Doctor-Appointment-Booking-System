import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ViewDoctors from "./ViewDoctors";

const AdminDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [view, setView] = useState("appointments");
  const [showPrevious, setShowPrevious] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check authentication on load
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin-login");
    }
  }, [navigate]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        console.log("token is ", token);
        if (!token) throw new Error("Unauthorized. Please log in.");

        const response = await fetch("http://localhost:5000/api/appointments", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch data");
        const data = await response.json();

        const today = new Date().toISOString().split("T")[0];
        const filteredAppointments = showPrevious
          ? data.filter((appt) => appt.appointment_date < today)
          : data.filter((appt) => appt.appointment_date >= today);

        setAppointments(filteredAppointments);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchAppointments();
  }, [showPrevious]);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin-login");
  };

  return (
    <div className="flex h-screen bg-blue-50">
      {/* Sidebar */}
      <div className="w-64 bg-blue-600 text-white p-5 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold">Admin Dashboard</h2>
          <nav className="mt-4">
            <ul>
              <li
                onClick={() => setView("appointments")}
                className="py-2 px-4 hover:bg-blue-500 cursor-pointer"
              >
                Appointments
              </li>
              <li
                onClick={() => setView("doctors")}
                className="py-2 px-4 hover:bg-blue-500 cursor-pointer"
              >
                Doctors
              </li>
            </ul>
          </nav>
        </div>
        <button
          className="bg-red-500 hover:bg-red-600 p-2 rounded text-white mt-4"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {view === "appointments" ? (
          <div>
            <h2 className="text-3xl font-semibold text-blue-800">
              {showPrevious
                ? "Previous Appointments"
                : "Scheduled Appointments"}
            </h2>
            {error && <p className="text-red-500">{error}</p>}
            <button
              onClick={() => setShowPrevious(!showPrevious)}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
            >
              {showPrevious
                ? "View Upcoming Appointments"
                : "View Previous Appointments"}
            </button>
            <div className="mt-4 bg-white p-4 rounded-lg shadow-md">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-blue-200 text-blue-800">
                    <th className="p-3 border">Doctor</th>
                    <th className="p-3 border">Patient</th>
                    <th className="p-3 border">Date</th>
                    <th className="p-3 border">Time Slot</th>
                    <th className="p-3 border">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.length > 0 ? (
                    appointments.map((appt) => (
                      <tr key={appt._id} className="text-center border">
                        <td className="p-3 border">{appt.doctor_name}</td>
                        <td className="p-3 border">{appt.patient_name}</td>
                        <td className="p-3 border">
                          {new Date(appt.appointment_date).toLocaleDateString()}
                        </td>
                        <td className="p-3 border">{appt.time_slot}</td>
                        <td className="p-3 border">
                          <span
                            className={`px-2 py-1 rounded text-white ${
                              appt.status === "Completed"
                                ? "bg-green-500"
                                : appt.status === "Cancelled"
                                ? "bg-red-500"
                                : "bg-yellow-500"
                            }`}
                          >
                            {appt.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="p-3 text-center text-gray-500">
                        No appointments found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <ViewDoctors />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
