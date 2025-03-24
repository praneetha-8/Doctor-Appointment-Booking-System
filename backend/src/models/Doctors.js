const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const doctorSchema = new mongoose.Schema({
    _id: { type: String, required: true }, // Explicitly defining _id as a string
    name: { type: String, required: true },
    specialization: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: false }, // ✅ Adding password field
    availability: {
        days: { type: [String], default: [] }, // Array of available days
        slots: { type: [String], default: [] }, // Array of time slots
    },
});


// ✅ Password hashing before saving
doctorSchema.pre("save", async function (next) {
    if (!this.isModified("password") || this.password.startsWith("$2b$")) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});


// ✅ Method to compare passwords
doctorSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const Doctor = mongoose.model("Doctor", doctorSchema, "Doctors");
module.exports = Doctor;
