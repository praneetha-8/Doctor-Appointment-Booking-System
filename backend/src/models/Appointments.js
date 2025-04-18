const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  _id: { type: String }, // Explicitly define _id as String
  patient_id: { type: String, ref: 'Patient', required: true },
  doctor_id: { type: String, ref: 'Doctor', required: true }, 
  doctor_name: { type: String, required: true },
  patient_name: { type: String, required: true },
  specialization: { type: String, required: true },
  appointment_date: { type: Date, required: true },
  time_slot: { type: String, required: true },
  status:{type:String,require:true}
  
});

const Appointment = mongoose.model('Appointment', appointmentSchema, "appointments");

module.exports = Appointment;