import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000";

const Profile = ({ patient: propPatient }) => {
  const navigate = useNavigate();
  const [patient, setPatient] = useState(propPatient || null);
  const [loading, setLoading] = useState(!propPatient);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatientData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/patient-login"); // Redirect to login if token is missing
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/api/patients/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPatient(response.data);
      } catch (err) {
        console.error("Error fetching patient profile:", err);
        setError("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (!propPatient) {
      fetchPatientData();
    }
  }, [propPatient, navigate]);

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="bg-white p-8 rounded-lg shadow">
      <h1 className="text-3xl font-bold mb-6">Patient Profile</h1>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <p><strong>Name:</strong> {patient?.name}</p>
          <p><strong>Email:</strong> {patient?.email}</p>
          <p><strong>Phone:</strong> {patient?.phone}</p>
          <p><strong>Age:</strong> {patient?.age}</p>
        </div>
        <div>
          <p><strong>Gender:</strong> {patient?.gender}</p>
          <p><strong>Address:</strong> {patient?.address}</p>
          <p><strong>Blood Group:</strong> {patient?.bloodGroup}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
