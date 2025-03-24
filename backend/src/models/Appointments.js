const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  _id: { type: String }, // Explicitly define _id as String
  patient_id: { type: String, ref: 'Patient', required: true }, // Changed to String to match Patient _id
  doctor_name: { type: String, required: true },
  patient_name: { type: String, required: true },
  specialization: { type: String, required: true },
  appointment_date: { type: Date, required: true },
  time_slot: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Confirmed', 'Cancelled', 'Completed', 'Pending'], // Added 'Pending' to enum
    default: 'Confirmed' 
  }
});

const Appointment = mongoose.model('Appointment', appointmentSchema, "appointments");

module.exports = Appointment;