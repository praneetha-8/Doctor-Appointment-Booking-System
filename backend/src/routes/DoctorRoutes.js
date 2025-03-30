require("dotenv").config(); // Load environment variables

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Doctor = require("../models/Doctors"); // Import the Doctor model

const JWT_SECRET = process.env.JWT_SECRET || "your_default_secret_key"; // Use .env for security

// Middleware to verify JWT
const authenticateDoctor = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.doctor = decoded; // Attach doctor data to the request
        next();
    } catch (error) {
        return res.status(400).json({ message: "Invalid or expired token" });
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


const generateRandomPassword = (length = 8) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let password = "";
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
};



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



router.post("/add", authenticateAdmin, async (req, res) => {
    const { name, email, specialization, phone, start_time, end_time } = req.body; // ✅ Include phone

    // 🔍 Validation: Check if required fields are provided
    if (!name || !email || !specialization || !phone || !start_time || !end_time) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        // 🔍 Check if doctor already exists
        let existingDoctor = await Doctor.findOne({ email });
        if (existingDoctor) {
            return res.status(400).json({ message: "Doctor with this email already exists" });
        }


        // 🔐 Generate a Random Password
        const randomPassword = generateRandomPassword();
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        // 📝 Create new doctor
        const newDoctor = new Doctor({
            _id: new mongoose.Types.ObjectId().toString(), 
            name,
            email,
            password: hashedPassword, 
            specialization,
            phone, // ✅ Now phone is correctly included
            time_slot: `${start_time} - ${end_time}`, // ✅ Combine start_time & end_time
        });

        // 💾 Save to Database
        await newDoctor.save();

        res.status(201).json({
            success: true,
            message: "Doctor added successfully",
            doctor: {
                _id: newDoctor._id,
                doctorId: newDoctor.doctorId, // Include assigned ID
                name: newDoctor.name,
                email: newDoctor.email,
                specialization: newDoctor.specialization,
            },
            generatedPassword: randomPassword // Send password to admin only for first-time login
        });

    } catch (error) {
        console.error("Error adding doctor:", error);
        res.status(500).json({ message: "Server error" });
    }
});



// ✅ Protected route (Doctor Profile)
router.get("/profile", authenticateDoctor, async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.doctor.doctorId).select("-password");
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }
        res.json(doctor);
    } catch (error) {
        console.error("Profile fetch error:", error);
        res.status(500).json({ message: "Error fetching profile" });
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


module.exports = router;
