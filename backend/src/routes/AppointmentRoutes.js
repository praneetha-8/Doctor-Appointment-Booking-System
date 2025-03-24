
const express = require('express');
const router = express.Router();
const Appointment = require("../models/Appointments");


router.get("/", async (req, res) => {
    try {
      const appointments = await Appointment.find();
      if (!appointments.length) {
        return res.status(404).json({ error: "No appointments found" });
      }
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ error: "Failed to fetch appointments" });
    }
  });
  
  // ✅ Get Appointments by Patient ID
  router.get("/:patientId", async (req, res) => {
    try {
      const { patientId } = req.params;
      console.log(`🔍 Fetching appointments for patient_id: ${patientId}`);
  
      const appointments = await Appointment.find({ patient_id: patientId });
      if (!appointments.length) {
        return res.status(404).json({ message: "No appointments found for this patient" });
      }
  
      console.log("📌 Found Appointments:", appointments);
      res.json(appointments);
    } catch (error) {
      console.error("❌ Error fetching appointments:", error);
      res.status(500).json({ message: "Error fetching appointments", error });
    }
  });
  
  module.exports = router;