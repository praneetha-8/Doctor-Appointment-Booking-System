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

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Invalid token format" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded._id) {
      return res.status(401).json({ message: "Invalid token structure. Missing _id." });
    }

    req.user = { _id: decoded._id };
    console.log("🟢 Authenticated User ID:", req.user._id);

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

router.put("/:id/cancel", authenticateUser, async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const { doctor_id } = req.body;  

    
    const appointment = await Appointment.findById(appointmentId);
    
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    
    if (appointment.status === "Cancelled") {
      return res.status(400).json({ message: "This appointment has already been cancelled" });
    }

    
    appointment.status = "Cancelled";
    await appointment.save();

    
    if (doctor_id) {
      
      await Doctor.findByIdAndUpdate(doctor_id, {
        $pull: { booked_slots: { date: appointment.appointment_date, time: appointment.time_slot } }
      });
    }

    res.json({ message: "Appointment cancelled successfully", appointment });
  } catch (error) {
    console.error("❌ Error cancelling appointment:", error);
    res.status(500).json({ message: "Server error cancelling appointment" });
  }
});


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
    console.log("📥 Received Appointment Data:", req.body);

    const {
      patient_id,
      doctor_id,
      doctor_name,
      patient_name,
      specialization,
      appointment_date,
      time_slot,
      status
    } = req.body;

    if (!patient_id || !doctor_id || !doctor_name || !patient_name || !specialization || !appointment_date || !time_slot||!status) {
      return res.status(400).json({ error: "Missing required fields" });
    }


    const newAppointment = new Appointment({
      _id: uuidv4(),
      patient_id,
      doctor_id,
      doctor_name,
      patient_name,
      specialization,
      appointment_date,
      time_slot,
      status: "Confirmed"
    });

    await newAppointment.save();
    res.status(201).json({ message: "✅ Appointment booked successfully", appointment: newAppointment });
  } catch (error) {
    console.error("❌ Error booking appointment:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Get all appointments for a patient (Protected)
router.get("/:patientId", authenticateUser, async (req, res) => {
  try {
    const { patientId } = req.params;
    const authenticatedUserId = req.user._id;

    console.log(`🟢 Requested Patient ID: ${patientId}`);
    console.log(`🟢 Authenticated User ID: ${authenticatedUserId}`);

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
