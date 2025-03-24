import React from 'react';

const Profile = ({ patient }) => {
  if (!patient) {
    return <div className="text-center py-10 text-red-500">No patient data available</div>;
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow">
      <h1 className="text-3xl font-bold mb-6">Patient Profile</h1>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <p><strong>Name:</strong> {patient.name}</p>
          <p><strong>Email:</strong> {patient.email}</p>
          <p><strong>Phone:</strong> {patient.phone}</p>
          <p><strong>Age:</strong> {patient.age}</p>
        </div>
        <div>
          <p><strong>Gender:</strong> {patient.gender}</p>
          <p><strong>Address:</strong> {patient.address}</p>
          <p><strong>Blood Group:</strong> {patient.bloodGroup}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
