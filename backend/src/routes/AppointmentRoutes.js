require("dotenv").config();
const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointments");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const JWT_SECRET = process.env.JWT_SECRET;



const authenticateUser = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
      return res.status(401).json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1]; // ✅ Extract token
  if (!token) {
      return res.status(401).json({ message: "Invalid token format" });
  }

  try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Ensure JWT_SECRET is used from environment variables

      // ✅ Ensure decoded token contains `_id`
      if (!decoded._id) {
          return res.status(401).json({ message: "Invalid token structure. Missing _id." });
      }

      req.user = { _id: decoded._id }; // ✅ Attach `_id`
      console.log("🟢 Authenticated User ID:", req.user._id);

      next();
  } catch (error) {
      return res.status(401).json({ message: "Invalid or expired token" });
  }
};


// ✅ Get All Appointments (Protected)
router.get("/", authenticateUser, async (req, res) => {
    try {
        const appointments = await Appointment.find();
        res.json(appointments);
    } catch (error) {
        console.error("Error fetching appointments:", error);
        res.status(500).json({ error: "Failed to fetch appointments" });
    }
});
router.post("/book", authenticateUser, async (req, res) => {
  try {
      console.log("Received Appointment Data:", req.body); // Debug log

      // Extract patient_id from request body instead of req.user
      const { patient_id, doctor_name, patient_name, specialization, appointment_date, time_slot } = req.body;

      if (!patient_id || !doctor_name || !patient_name || !specialization || !appointment_date || !time_slot) {
          return res.status(400).json({ error: "Missing required fields" });
      }

      const newAppointment = new Appointment({
          _id: uuidv4(),
          patient_id, // ✅ Now using patient_id from req.body
          doctor_name,
          patient_name,
          specialization,
          appointment_date,
          time_slot,
          status: "Confirmed",
      });

      await newAppointment.save();
      res.status(201).json({ message: "Appointment booked successfully", appointment: newAppointment });
  } catch (error) {
      console.error("Error booking appointment:", error);
      res.status(500).json({ error: error.message });
  }
});

router.get("/:patientId", authenticateUser, async (req, res) => {
  try {
    const { patientId } = req.params;
    const authenticatedUserId = req.user._id; // Get logged-in user ID

    console.log(`🟢 Requested Patient ID: ${patientId}`);
    console.log(`🟢 Authenticated User ID: ${authenticatedUserId}`);

    // Ensure that the user is only accessing their own data
    if (authenticatedUserId !== patientId) {
      console.warn("🔴 Unauthorized access attempt.");
      return res.status(403).json({ message: "Access denied. Unauthorized request." });
    }

    const appointments = await Appointment.find({ patient_id: patientId });

    if (!appointments.length) {
      return res.status(404).json({ message: "No appointments found" });
    }

    res.json(appointments);
  } catch (error) {
    console.error("❌ Error fetching appointments:", error);
    res.status(500).json({ message: "Error fetching appointments", error });
  }
});


module.exports = router;
