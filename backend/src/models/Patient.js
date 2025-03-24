const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const PatientSchema = new mongoose.Schema({
  _id: { type: String },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },  // Added phone field
  age: { type: Number, required: true },    // Added age field
  gender: { type: String, required: true }, // Added gender field
  address: { type: String, required: true },
  medical_history: { type: [String], default: [] }, // Added medical_history array
});

// Hash password before saving
PatientSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
PatientSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


// Export the model separately
const Patient = mongoose.model("Patient", PatientSchema, "patients");
module.exports = Patient;
