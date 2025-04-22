require("dotenv").config(); // Load environment variables
const nodemailer = require("nodemailer");
const axios = require("axios");

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Doctor = require("../models/Doctors"); // Import the Doctor model
const Appointment = require("../models/Appointments");

const JWT_SECRET = process.env.JWT_SECRET || "your_default_secret_key"; // Use .env for security

const verifyTokenForDoctor = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access Denied. No token provided." });
  }

  const token = authHeader.split(" ")[1]; // Extract token

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.doctor = decoded; // Attach decoded doctor details
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Middleware to verify JWT for admin authentication
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

// Replace the generateRandomPassword function and its usage in the /add route

// Remove or comment out the original random password generator function
// const generateRandomPassword = (length = 8) => {
//   const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//   let password = "";
//   for (let i = 0; i < length; i++) {
//     password += chars.charAt(Math.floor(Math.random() * chars.length));
//   }
//   return password;
// };

// Add this new function to generate password from doctor's name
const generatePasswordFromName = (name) => {
  // Convert name to lowercase and remove any spaces or special characters
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
};

// Then modify the doctor add route
// router.post("/add", authenticateAdmin, async (req, res) => {
//   const { name, email, specialization, phone } = req.body;

//   // 🔍 Validation: Check if required fields are provided
//   if (!name || !email || !specialization || !phone) {
//     return res.status(400).json({ message: "All fields are required" });
//   }

//   try {
//     // 🔍 Check if doctor already exists
//     let existingDoctor = await Doctor.findOne({ email });
//     if (existingDoctor) {
//       return res.status(400).json({ message: "Doctor with this email already exists" });
//     }

//     // 🔐 Generate Password from Doctor's Name
//     const passwordFromName = generatePasswordFromName(name);
//     const hashedPassword = await bcrypt.hash(passwordFromName, 10);

//     // 📝 Create new doctor
//     const newDoctor = new Doctor({
//       _id: new mongoose.Types.ObjectId().toString(),
//       name,
//       email,
//       password: hashedPassword,
//       specialization,
//       phone,
//       time_slots: [], // Empty array for time slots
//     });

//     // 💾 Save to Database
//     await newDoctor.save();

//     res.status(201).json({
//       success: true,
//       message: "Doctor added successfully",
//       doctor: {
//         _id: newDoctor._id,
//         name: newDoctor.name,
//         email: newDoctor.email,
//         specialization: newDoctor.specialization,
//         time_slots: newDoctor.time_slots,
//       },
//       generatedPassword: passwordFromName
//     });
//   } catch (error) {
//     console.error("Error adding doctor:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

router.post("/add", authenticateAdmin, async (req, res) => {
  const { name, email, specialization, phone } = req.body;

  if (!name || !email || !specialization || !phone) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingDoctor = await Doctor.findOne({ email });
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

    // Send welcome email via email route
    try {
      await axios.post(`http://localhost:5000/api/email/send-welcome`, {
        name,
        email,
        password: passwordFromName,
      });
    } catch (emailErr) {
      console.error("Failed to send welcome email:", emailErr.message);
      // Optionally: continue without blocking doctor creation
    }

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
      generatedPassword: passwordFromName,
    });

  } catch (error) {
    console.error("Error adding doctor:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// ✅ Doctor Login Route with JWT Token
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

    // Generate JWT Token
    const token = jwt.sign(
      { doctorId: doctor._id, name: doctor.name, specialization: doctor.specialization },
      JWT_SECRET,
      { expiresIn: "1h" } // Token expires in 1 hour
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token, // Send token to the client
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


// Get all time slots for a doctor
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

// Delete a time slot
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
    
    // First check if the slot is booked
    const slotToDelete = doctor.time_slots[dateIndex].slots.find(slot => slot.time === slotTime);
    
    if (slotToDelete && slotToDelete.status === 'booked') {
      return res.status(400).json({ message: "Cannot delete a booked slot" });
    }
    
    // Filter out the slot to remove by time property
    doctor.time_slots[dateIndex].slots = doctor.time_slots[dateIndex].slots
      .filter(slot => slot.time !== slotTime);
    
    // If no slots left for this date, remove the date entry
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

// ✅ Get Doctor Profile (Protected)
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

// ✅ API Route to View Doctors (Admin Only)
router.get("/viewdoctors", authenticateAdmin, async (req, res) => {
  try {
    const doctors = await Doctor.find().select("-password"); // Exclude passwords
    res.status(200).json(doctors);
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ message: "Error retrieving doctors" });
  }
});

// Get appointments for a doctor on a specific date
router.get('/appointments', verifyTokenForDoctor, async (req, res) => {
  try {
    const { date } = req.query;
    const doctorId = req.doctor.doctorId;

    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    // Create date range for the selected date (start of day to end of day)
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    // Find appointments matching the criteria
    const appointments = await Appointment.find({
      doctor_id: doctorId,
      appointment_date: {
        $gte: startDate,
        $lte: endDate
      }
    });

    // For each appointment that exists, update the corresponding slot status to 'booked'
    if (appointments.length > 0) {
      const doctor = await Doctor.findById(doctorId);
      
      if (doctor) {
        const dateSlotIndex = doctor.time_slots.findIndex(ts => ts.date === date);
        
        if (dateSlotIndex !== -1) {
          // Update slot status for each appointment
          appointments.forEach(appointment => {
            const slotIndex = doctor.time_slots[dateSlotIndex].slots.findIndex(
              slot => slot.time === appointment.time_slot
            );
            
            if (slotIndex !== -1) {
              doctor.time_slots[dateSlotIndex].slots[slotIndex].status = 'booked';
            }
          });
          
          // Save the updated doctor document
          await doctor.save();
        }
      }
    }

    return res.json(appointments);
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// ✅ Mark an appointment as completed (Doctor/Admin access)
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

    // 🚫 Block future date appointments
    if (appointmentDateOnly > currentDateOnly) {
      return res.status(400).json({
        message: "❌ You cannot mark future appointments as completed.",
      });
    }

    // ✅ Allow past date appointments
    if (appointmentDateOnly < currentDateOnly) {
      appointment.status = "Completed";
      await appointment.save();
      return res.status(200).json({
        message: "✅ Appointment marked as completed",
        appointment,
      });
    }

    // 🕒 If date is today, compare time
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

    // ✅ Valid date and time, mark as completed
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

router.delete("/deletedoctor/:id", async (req, res) => {
  try {
    console.log("Delete request received with ID:", req.params.id);

    const deletedDoctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!deletedDoctor) {
      console.log("Doctor not found");
      return res.status(404).json({ error: "Doctor not found" });
    }
    
    // Call the email API instead of the function directly
    try {
      await axios.post(`${process.env.API_BASE_URL || 'http://localhost:5000'}/api/email/send-doctor-removal`, {
        doctorEmail: deletedDoctor.email,
        doctorName: deletedDoctor.name
      });
      console.log(`Email removal request sent for Dr. ${deletedDoctor.name}`);
    } catch (emailErr) {
      //console.error("Failed to send doctor removal email:", emailErr);
      // Continue with deletion even if email fails
    }
    
    res.status(200).json({ message: "Doctor deleted successfully" });
  } catch (err) {
    console.error("Error deleting doctor:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;