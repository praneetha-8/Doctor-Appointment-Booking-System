const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');

// Schema for individual time slot with status
const slotSchema = new mongoose.Schema({
  time: { type: String, required: true },
  status: { type: String, enum: ['free', 'booked'], default: 'free' }
}, { _id: false });

// Schema for date with multiple slots
const timeSlotSchema = new mongoose.Schema({
  date: { type: String, required: true },
  slots: [slotSchema] // Array of slots with time and status
}, { _id: false });

const doctorSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Explicitly defining _id as a string
  name: { type: String, required: true },
  specialization: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  time_slots: [timeSlotSchema] // Array of time slots with dates
});

// Password hashing before saving
doctorSchema.pre("save", async function (next) {
  if (!this.isModified("password") || this.password.startsWith("$2")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare passwords
doctorSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Doctor = mongoose.model("Doctor", doctorSchema, "Doctors");
module.exports = Doctor;