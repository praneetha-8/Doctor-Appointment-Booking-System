require("dotenv").config(); 

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const expressListEndpoints = require("express-list-endpoints");


const patientRoutes = require("./src/routes/patientRoutes");
const adminRoutes = require("./src/routes/Adminroutes");
const doctorsRoutes = require("./src/routes/DoctorRoutes");
const appointmentRoutes=require("./src/routes/AppointmentRoutes");

const app = express();

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGO_URI is missing from .env file!");
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      
    });

    console.log(`MongoDB Connected: successfully`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api", (req, res) => {
  const endpoints = expressListEndpoints(app);
  res.json(endpoints);
});

app.get("/", (req, res) => {
  res.send("Doctor Appointment System API is running...");
});

// ✅ Routes
app.use("/api/patients", patientRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/doctors", doctorsRoutes);
app.use("/api/appointments",appointmentRoutes);

// ✅ Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
