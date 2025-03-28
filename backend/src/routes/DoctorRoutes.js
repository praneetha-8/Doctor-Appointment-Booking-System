const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Doctor = require("../models/Doctors"); // Import the Doctor model

// Get all doctors
router.get("/viewdoctors", async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: "Error fetching doctors", error: error.message });
  }
});
router.post("/add", async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    const { name, specialization, email, phone, password, start_time, end_time } = req.body;

    // Ensure start_time and end_time are provided
    if (!start_time || !end_time) {
      return res.status(400).json({ message: "Start time and end time are required" });
    }

    // Format the time slot as "HH:MM AM - HH:MM PM"
    const time_slot = `${start_time} - ${end_time}`;

    const newDoctor = new Doctor({
      _id: new mongoose.Types.ObjectId().toString(),
      name,
      specialization,
      email,
      phone,
      password: await bcrypt.hash(password || "defaultPassword", 10),
      time_slot, // Store the combined time slot as a string
    });

    await newDoctor.save();
    res.status(201).json(newDoctor);
  } catch (error) {
    console.error("Error adding doctor:", error);
    if (error.code === 11000) {
      res.status(400).json({ message: "A doctor with that email already exists", error: error.message });
    } else {
      res.status(500).json({ message: "Error adding doctor", error: error.message });
    }
  }
});




router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    console.log("Doctor login attempt with email:", email);

    try {
        const doctor = await Doctor.findOne({ email });
        console.log("Found doctor:", doctor);

        if (!doctor) {
            return res.status(400).json({ message: "User not found" });
        }

        console.log("Checking password...");
        console.log("Entered Password:", password);
        console.log("Stored Hashed Password:", doctor.password);

        // Extract salt from stored hash (first 29 characters of bcrypt hash)
        const extractedSalt = doctor.password.substring(0, 29);
        console.log("Extracted Salt:", extractedSalt);

        // Rehash the entered password using the extracted salt
        const rehashedPassword = await bcrypt.hash(password, extractedSalt);
        console.log("Rehashed Password:", rehashedPassword);

        // Compare the new hash with the stored hash
        const isMatch = await bcrypt.compare(password, doctor.password);
        console.log("Password match result:", isMatch ? "✅ Correct Password" : "❌ Wrong Password");

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        res.json({
            message: "Login successful",
            doctor: {
                _id: doctor._id,
                name: doctor.name,
                email: doctor.email,
                specialization: doctor.specialization,
            },
        });

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: "Server error", error });
    }
});
module.exports = router;
