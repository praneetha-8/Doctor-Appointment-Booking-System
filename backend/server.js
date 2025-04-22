require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const expressListEndpoints = require("express-list-endpoints");
const patientRoutes = require("./src/routes/patientRoutes");
const adminRoutes = require("./src/routes/Adminroutes");
const doctorsRoutes = require("./src/routes/DoctorRoutes");
const appointmentRoutes = require("./src/routes/AppointmentRoutes");
const emailRoutes  = require("./src/routes/emailRoutes");
const chatbotRoutes = require("./src/routes/chatbotRoutes");

const app = express();

// Connect to MongoDB
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from .env file!");
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Error: ", error.message);
    process.exit(1);
  }
};

connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root Endpoints
app.get("/api", (req, res) => {
  const endpoints = expressListEndpoints(app);
  res.json(endpoints);
});
app.get("/", (req, res) => {
  res.send("Doctor Appointment System API is running...");
});

// API Routes
app.use("/api/patients", patientRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/doctors", doctorsRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/chatbot", chatbotRoutes); // Chatbot API

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
