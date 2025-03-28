import React from "react";
import { useNavigate } from "react-router-dom";
import { Stethoscope, Brain, Heart, Bone, Eye, Ear, Baby, User } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTooth } from "@fortawesome/free-solid-svg-icons";

const specialists = [
  { name: "General Physician", icon: <Stethoscope />, field: "General" },
  { name: "Neurologist", icon: <Brain />, field: "Neurology" },
  { name: "Cardiologist", icon: <Heart />, field: "Cardiology" },
  { name: "Dentist", icon: <FontAwesomeIcon icon={faTooth} className="text-2xl mb-0 mt-0"/>, field: "Dentist" }, 
  { name: "Orthopedic", icon: <Bone />, field: "Orthopedics" },
  { name: "Ophthalmologist", icon: <Eye />, field: "Ophthalmology" },
  { name: "ENT Specialist", icon: <Ear />, field: "ENT" },
  { name: "Pediatrician", icon: <Baby />, field: "Pediatrician" },
  { name: "Dermatologist", icon: <User />, field: "Dermatologist" },
];

const Homepagepatient = ({ patientId }) => {
  const navigate = useNavigate();

  const bookAppointment = (specialist) => {
    navigate(`/patient-dashboard/specialist`, { 
      state: { 
        patientId, 
        specialistName: specialist.name, 
        specialistField: specialist.field 
      } 
    });
  };
  
  

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">Select a Specialist</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {specialists.map((specialist) => (
          <div
            key={specialist.name}
            className="bg-white p-6 rounded-lg shadow flex flex-col items-center"
          >
            <div className="text-blue-600 text-5xl mb-4">{specialist.icon}</div>
            <h3 className="text-xl font-semibold">{specialist.name}</h3>
            <p className="text-gray-500">{specialist.field}</p>
            <button
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={() => bookAppointment(specialist)}
            >
              
              Book Appointment
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Homepagepatient;
