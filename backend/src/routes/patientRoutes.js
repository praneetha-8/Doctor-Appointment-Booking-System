


const express = require('express');
const bcrypt = require('bcryptjs');
const mongoose = require("mongoose");
const Patient = require('../models/Patient');



const router = express.Router();
require("dotenv").config();

// ✅ Get All Patients
router.get('/', async (req, res) => {
    try {
      const patients = await Patient.find();
      res.json(patients);
    } catch (error) {
      res.status(500).json({ message: "Error fetching patients", error: error.message });
    }
});

// ✅ Get Patient Schema
router.get('/schema', (req, res) => {
    res.json(Patient.schema.obj);
});
// ✅ Patient Signup
router.post("/signup", async (req, res) => {
    try {
        console.log("Received Data:", req.body);
        const { name, email, password, phone, dob, gender, age, address, medical_history } = req.body;

        if (!name || !email || !password || !phone || !dob || !age || !gender || !address) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Check if email already exists
        const existingPatient = await Patient.findOne({ email });
        if (existingPatient) {
            return res.status(400).json({ message: "Email already registered!" });
        }

        console.log("Received Password Before Saving:", password);

        // ✅ Ensure medical_history is correctly formatted
        const formattedMedicalHistory = Array.isArray(medical_history)
            ? medical_history.filter(item => item.trim() !== '')  // Remove empty values
            : medical_history ? [medical_history] : [];

        // Save patient details
        const newPatient = new Patient({
            _id: crypto.randomUUID(),
            name,
            email,
            password,
            phone,
            dob,
            age,
            gender,
            address,
            medical_history: formattedMedicalHistory,  // ✅ Corrected field
        });

        await newPatient.save();

        res.status(201).json({ 
            message: "Signup successful!", 
            patient: {
              _id: newPatient._id,  
              name: newPatient.name,
              email: newPatient.email
            }
          });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: "Server Error. Please try again." });
    }
});

// ✅ Patient Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    console.log("Login attempt with email:", email);

    try {
        const patient = await Patient.findOne({ email });
        console.log("Found patient:", patient);

        if (!patient) {
            return res.status(400).json({ message: "User not found" });
        }

        console.log("Checking password...");
        console.log("Entered Password:", password);
        const isMatch = await patient.matchPassword(password);
        console.log("Password match result:", isMatch);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        res.json({
            message: "Login successful",
            patient: {
                _id: patient._id,
                name: patient.name,
                email: patient.email,
            },
        });

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: "Server error", error });
    }
});




// Get Patient Details by ID 
router.get("/:id", async (req, res) => {
  try {
      const { id } = req.params;
      
      console.log(`Fetching patient with ID: ${id}`);

      // Remove ObjectId validation since we're using string IDs
      const patient = await Patient.findOne({ _id: id })
          .select('-password') // Exclude password from the response
          .lean(); // Convert to plain JavaScript object

      if (!patient) {
          console.log('No patient found with ID:', id);
          return res.status(404).json({ message: "Patient not found" });
      }

      console.log('Found patient:', patient);
      res.json(patient);
  } catch (error) {
      console.error("Error fetching patient:", error);
      res.status(500).json({ 
          message: "Server error", 
          error: error.message 
      });
  }
});


module.exports = router;

