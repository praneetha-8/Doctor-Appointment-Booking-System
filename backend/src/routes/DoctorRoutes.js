require("dotenv").config();
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Doctor = require("../models/Doctors");
const Appointment = require("../models/Appointments");

const JWT_SECRET = process.env.JWT_SECRET || "your_default_secret_key";

// Middleware to verify token for doctor
const verifyTokenForDoctor = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access Denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.doctor = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Middleware to verify token for admin
const authenticateAdmin = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }
};

// Generate password from doctor's name
const generatePasswordFromName = (name) => {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
};

// Add new doctor
router.post("/add", authenticateAdmin, async (req, res) => {
  const { name, email, specialization, phone } = req.body;

  if (!name || !email || !specialization || !phone) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    let existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({ message: "Doctor with this email already exists" });
    }

    const passwordFromName = generatePasswordFromName(name);
    const hashedPassword = await bcrypt.hash(passwordFromName, 10);

    const newDoctor = new Doctor({
      _id: new mongoose.Types.ObjectId().toString(),
      name,
      email,
      password: hashedPassword,
      specialization,
      phone,
      time_slots: [],
    });

    await newDoctor.save();

    res.status(201).json({
      success: true,
      message: "Doctor added successfully",
      doctor: {
        _id: newDoctor._id,
        name: newDoctor.name,
        email: newDoctor.email,
        specialization: newDoctor.specialization,
        time_slots: newDoctor.time_slots,
      },
      generatedPassword: passwordFromName
    });
  } catch (error) {
    console.error("Error adding doctor:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Doctor login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { doctorId: doctor._id, name: doctor.name, specialization: doctor.specialization },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      doctor: {
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Add time slots
router.post("/add-timeslot", verifyTokenForDoctor, async (req, res) => {
  const { date, slots } = req.body;

  if (!date || !Array.isArray(slots) || slots.length === 0) {
    return res.status(400).json({ message: "Invalid request. Provide date and time slots." });
  }

  try {
    const doctor = await Doctor.findById(req.doctor.doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const today = new Date();
    const inputDate = new Date(date);
    const todayStr = today.toISOString().split("T")[0];
    const inputDateStr = inputDate.toISOString().split("T")[0];

    if (inputDateStr < todayStr) {
      return res.status(400).json({ message: "Cannot add slots for past dates." });
    }

    let filteredSlots = [];

    for (const slot of slots) {
      if (!slot.time) return res.status(400).json({ message: "Missing time field in slot." });

      const [start, end] = slot.time.split(" - ");
      if (!start || !end) {
        return res.status(400).json({ message: `Invalid time format: ${slot.time}` });
      }

      const [startHour, startMin] = start.split(":").map(Number);
      const [endHour, endMin] = end.split(":").map(Number);

      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      if (startMinutes >= endMinutes) {
        return res.status(400).json({ message: `Invalid slot: ${slot.time}` });
      }

      if (inputDateStr === todayStr) {
        const nowMinutes = today.getHours() * 60 + today.getMinutes();
        if (startMinutes <= nowMinutes) continue;
      }

      filteredSlots.push(slot);
    }

    if (filteredSlots.length === 0) {
      return res.status(400).json({ message: "All slots are in the past or invalid." });
    }

    const existingSlotIndex = doctor.time_slots.findIndex(ts => ts.date === date);

    if (existingSlotIndex >= 0) {
      const existingSlots = doctor.time_slots[existingSlotIndex].slots;
      const uniqueNewSlots = filteredSlots.filter(newSlot =>
        !existingSlots.some(existingSlot => existingSlot.time === newSlot.time)
      );
      doctor.time_slots[existingSlotIndex].slots = [...existingSlots, ...uniqueNewSlots];
    } else {
      doctor.time_slots.push({ date, slots: filteredSlots });
    }

    await doctor.save();

    res.status(200).json({
      success: true,
      message: "Time slots added successfully",
      time_slots: doctor.time_slots,
    });

  } catch (err) {
    console.error("Error in adding time slots:", err);
    res.status(500).json({ message: "Server error while adding time slots" });
  }
});

// Get time slots
router.get("/time-slots", verifyTokenForDoctor, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.doctor.doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    
    res.status(200).json({
      success: true,
      time_slots: doctor.time_slots || []
    });
    
  } catch (error) {
    console.error("Error fetching time slots:", error);
    res.status(500).json({ message: "Server error while fetching time slots" });
  }
});

// Delete time slot
router.delete("/delete-slot", verifyTokenForDoctor, async (req, res) => {
  const { date, slotTime } = req.body;
  
  if (!date || !slotTime) {
    return res.status(400).json({ message: "Date and slot time are required" });
  }
  
  try {
    const doctor = await Doctor.findById(req.doctor.doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    
    const dateIndex = doctor.time_slots.findIndex(ts => ts.date === date);
    if (dateIndex === -1) {
      return res.status(404).json({ message: "No slots found for this date" });
    }
    
    const slotToDelete = doctor.time_slots[dateIndex].slots.find(slot => slot.time === slotTime);
    
    if (slotToDelete && slotToDelete.status === 'booked') {
      // Check if there's an active appointment for this slot
      const appointmentDate = new Date(date);
      appointmentDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      const existingAppointment = await Appointment.findOne({
        doctor_id: doctor._id,
        appointment_date: {
          $gte: appointmentDate,
          $lte: endDate
        },
        time_slot: slotTime,
        status: { $ne: 'Cancelled' }
      });
      
      if (existingAppointment) {
        return res.status(400).json({ 
          message: "Cannot delete a slot with an active appointment" 
        });
      }
    }
    
    doctor.time_slots[dateIndex].slots = doctor.time_slots[dateIndex].slots
      .filter(slot => slot.time !== slotTime);
    
    if (doctor.time_slots[dateIndex].slots.length === 0) {
      doctor.time_slots.splice(dateIndex, 1);
    }
    
    await doctor.save();
    
    res.status(200).json({
      success: true,
      message: "Slot removed successfully",
      time_slots: doctor.time_slots
    });
    
  } catch (error) {
    console.error("Error removing time slot:", error);
    res.status(500).json({ message: "Server error while removing time slot" });
  }
});

// Get doctor profile
router.get("/profile", verifyTokenForDoctor, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.doctor.doctorId).select("-password");
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    res.json(doctor);
  } catch (error) {
    console.error("Profile Fetch Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// View all doctors (admin only)
router.get("/viewdoctors", authenticateAdmin, async (req, res) => {
  try {
    const doctors = await Doctor.find().select("-password");
    res.status(200).json(doctors);
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ message: "Error retrieving doctors" });
  }
});

// Get appointments for a doctor
router.get('/appointments', verifyTokenForDoctor, async (req, res) => {
  try {
    const { date } = req.query;
    const doctorId = req.doctor.doctorId;

    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const appointments = await Appointment.find({
      doctor_id: doctorId,
      appointment_date: {
        $gte: startDate,
        $lte: endDate
      }
    }).populate('patient_id', 'name email phone');

    // Sync slot statuses with appointments
    const doctor = await Doctor.findById(doctorId);
    if (doctor) {
      const dateSlotIndex = doctor.time_slots.findIndex(ts => ts.date === date);
      
      if (dateSlotIndex !== -1) {
        // Reset all slots to free first
        doctor.time_slots[dateSlotIndex].slots.forEach(slot => {
          slot.status = 'free';
        });

        // Mark booked slots based on active appointments
        const activeAppointments = appointments.filter(a => a.status !== 'Cancelled');
        activeAppointments.forEach(appointment => {
          const slotIndex = doctor.time_slots[dateSlotIndex].slots.findIndex(
            slot => slot.time === appointment.time_slot
          );
          
          if (slotIndex !== -1) {
            doctor.time_slots[dateSlotIndex].slots[slotIndex].status = 'booked';
          }
        });
        
        await doctor.save();
      }
    }

    return res.json(appointments);
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark appointment as completed
router.put("/appointments/complete/:appointmentId", verifyTokenForDoctor, async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const now = new Date();
    const appointmentDate = new Date(appointment.appointment_date);
    const appointmentDateOnly = new Date(appointmentDate.toDateString());
    const currentDateOnly = new Date(now.toDateString());

    if (appointmentDateOnly > currentDateOnly) {
      return res.status(400).json({
        message: "❌ You cannot mark future appointments as completed.",
      });
    }

    if (appointmentDateOnly < currentDateOnly) {
      appointment.status = "Completed";
      await appointment.save();
      return res.status(200).json({
        message: "✅ Appointment marked as completed",
        appointment,
      });
    }

    const [hour, minute] = appointment.time_slot.split(":");
    const appointmentTime = new Date(appointment.appointment_date);
    appointmentTime.setHours(+hour);
    appointmentTime.setMinutes(+minute);
    appointmentTime.setSeconds(0);

    if (appointmentTime > now) {
      return res.status(400).json({
        message: "❌ You cannot mark an upcoming time slot as completed.",
      });
    }

    appointment.status = "Completed";
    await appointment.save();

    res.status(200).json({
      message: "✅ Appointment marked as completed",
      appointment,
    });
  } catch (error) {
    console.error("❌ Error updating appointment status:", error);
    res.status(500).json({ message: "Server error while updating appointment" });
  }
});

// Sync slots with appointments (manual trigger)
router.post("/sync-slots", verifyTokenForDoctor, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.doctor.doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // For each date with slots
    for (const dateSlot of doctor.time_slots) {
      // Get all appointments for this date
      const startDate = new Date(dateSlot.date);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(dateSlot.date);
      endDate.setHours(23, 59, 59, 999);

      const appointments = await Appointment.find({
        doctor_id: doctor._id,
        appointment_date: {
          $gte: startDate,
          $lte: endDate
        }
      });

      // Reset all slots to free first
      dateSlot.slots.forEach(slot => {
        slot.status = 'free';
      });

      // Mark booked slots based on existing appointments
      appointments.forEach(appointment => {
        if (appointment.status !== 'Cancelled') {
          const slot = dateSlot.slots.find(s => s.time === appointment.time_slot);
          if (slot) {
            slot.status = 'booked';
          }
        }
      });
    }

    await doctor.save();
    res.json({ message: "Slots synchronized successfully", doctor });
  } catch (error) {
    console.error("Error synchronizing slots:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;