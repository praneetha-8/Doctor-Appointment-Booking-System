require("dotenv").config(); // Load environment variables

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctors");
const Appointment=require("../models/Appointments")
const router = express.Router();

// ✅ Middleware to verify JWT
const verifyToken = (req, res, next) => {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Access Denied. No token provided." });
    }

    const token = authHeader.split(" ")[1]; // Extract token

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.patient = decoded; // Attach decoded patient details
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

// ✅ Get All Patients (Protected)
router.get("/", verifyToken, async (req, res) => {
    try {
        const patients = await Patient.find().select("-password");
        res.json(patients);
    } catch (error) {
        res.status(500).json({ message: "Error fetching patients", error: error.message });
    }
});

// ✅ Patient Signup
router.post("/signup", async (req, res) => {
    try {
        const { name, email, password, phone, dob, gender, age, address, medical_history } = req.body;

        if (!name || !email || !password || !phone || !dob || !age || !gender || !address) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const existingPatient = await Patient.findOne({ email });
        if (existingPatient) {
            return res.status(400).json({ message: "Email already registered!" });
        }

        // ✅ No need to hash password here (model already does it)
        const newPatient = new Patient({
            _id: new mongoose.Types.ObjectId().toString(),
            name,
            email,
            password, // 🚀 Mongoose model will hash this automatically
            phone,
            dob,
            age,
            gender,
            address,
            medical_history: Array.isArray(medical_history) ? medical_history.filter(item => item.trim() !== "") : [],
        });

        await newPatient.save();

        // ✅ Fetch saved user to confirm stored password (Debugging)
        const savedPatient = await Patient.findOne({ email });
        console.log("Stored Password in DB:", savedPatient.password);

        // ✅ Generate JWT Token
        const token = jwt.sign(
            { _id: newPatient._id, email: newPatient.email, name: newPatient.name },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(201).json({
            message: "Signup successful!",
            token,
            patient: {
                _id: newPatient._id,
                name: newPatient.name,
                email: newPatient.email,
            },
        });
    } catch (error) {
        console.error("Signup Error:", error.message, error.stack);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("Email Entered:", email);
        console.log("Password Entered:", password);

        const patient = await Patient.findOne({ email });
        if (!patient) {
            return res.status(400).json({ message: "User not found" });
        }

        console.log("Stored Hashed Password:", patient.password); // Debugging

        // Compare password using bcrypt
        const isMatch = await bcrypt.compare(password, patient.password);
        console.log("Password Match:", isMatch); // Should print true if correct

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate JWT Token
        const token = jwt.sign(
            { _id: patient._id, email: patient.email, name: patient.name },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({
            message: "Login successful",
            token,
            patient: {
                _id: patient._id,
                name: patient.name,
                email: patient.email,
            },
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


// ✅ Get Patient Profile (Protected)
router.get("/profile", verifyToken, async (req, res) => {
    try {
        const patient = await Patient.findById(req.patient._id).select("-password");
        if (!patient) return res.status(404).json({ message: "Patient not found" });

        res.json(patient);
    } catch (error) {
        console.error("Profile Fetch Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// ✅ Get Specialist List
router.get("/specialist_list", async (req, res) => {
    try {
        const { specialization } = req.query;

        if (!specialization) {
            return res.status(400).json({ message: "Specialization is required" });
        }

        const doctors = await Doctor.find({ specialization });

        if (doctors.length === 0) {
            return res.status(404).json({ message: "No doctors found for this specialization" });
        }

        res.json(doctors);
    } catch (error) {
        console.error("Error fetching specialist list:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


// ✅ Get Patient by ID (Protected)
router.get("/:id", verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const patient = await Patient.findById(id).select("-password");

        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }

        res.json(patient);
    } catch (error) {
        console.error("Error fetching patient:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;
