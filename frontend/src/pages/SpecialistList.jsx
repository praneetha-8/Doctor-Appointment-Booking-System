import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { AlertCircle, ArrowLeft } from "lucide-react";

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
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
          <AlertCircle className="text-red-500 w-12 h-12 mb-4" />
          <p className="text-red-500 text-lg">{error}</p>
          <p className="text-gray-500 mt-2">
            Please try another specialization or check back later.
          </p>
          <button
            className="mt-4 flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2" /> Go Back
          </button>
        </div>
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
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
          <AlertCircle className="text-yellow-500 w-12 h-12 mb-4" />
          <p className="text-yellow-500 text-lg">No doctors available for {specialistName}.</p>
          <p className="text-gray-500 mt-2">
            We apologize for the inconvenience. You can check back later or choose another specialization.
          </p>
          <button
            className="mt-4 flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2" /> Go Back
          </button>
        </div>
      )}
    </div>
  );
};

export default SpecialistList;
