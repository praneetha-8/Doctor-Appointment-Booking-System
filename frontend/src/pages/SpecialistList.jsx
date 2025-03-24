import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

const SpecialistList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { patientId, specialistName, specialistField } = location.state || {};

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (specialistField) {
      axios
        .get(`${API_BASE_URL}/api/patients/specialist_list?specialization=${specialistField}`)
        .then((response) => {
          setDoctors(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching doctors:", error);
  
          if (error.response && error.response.status === 404) {
            setError(`No doctors available for ${specialistName}.`);
          } else {
            setError("Failed to fetch doctors. Please try again later.");
          }
  
          setLoading(false);
        });
    }
  }, [specialistField]);
  

  const bookDoctor = (doctor) => {
    navigate("/confirm-appointment", { state: { patientId, doctor } });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">Available {specialistName}s</h1>

      {loading ? (
        <p className="text-gray-500">Loading doctors...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : doctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <div key={doctor._id} className="bg-white p-6 rounded-lg shadow flex flex-col items-center">
              <h3 className="text-xl font-semibold">{doctor.name}</h3>
              <p className="text-gray-500">{doctor.specialization}</p>
              <button
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => bookDoctor(doctor)}
              >
                Book Appointment
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No doctors available for {specialistName}.</p>
      )}
    </div>
  );
};

export default SpecialistList;
