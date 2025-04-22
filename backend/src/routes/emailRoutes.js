const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
require("dotenv").config();

// Shared transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Appointment Confirmation Email
router.post("/send-confirmation", async (req, res) => {
  const { patientName, doctorName, specialization, selectedDate, timeSlot, toEmail } = req.body;

  if (!toEmail) return res.status(400).json({ error: "Missing recipient email" });

  const mailOptions = {
    from: `"Doctor Appointment App" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Appointment Confirmation",
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2 style="color: green;">Booking Confirmed!</h2>
        <p>Dear <strong>${patientName}</strong>,</p>
        <p>Your appointment has been successfully scheduled.</p>
        <ul>
          <li><strong>Doctor:</strong> ${doctorName}</li>
          <li><strong>Specialization:</strong> ${specialization}</li>
          <li><strong>Date:</strong> ${selectedDate}</li>
          <li><strong>Time:</strong> ${timeSlot}</li>
        </ul>
        <p>Thank you for using our service!</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: "Confirmation email sent" });
  } catch (err) {
    console.error("Email Error:", err);
    res.status(500).json({ error: "Failed to send email" });
  }
});

// Appointment Cancellation Email
router.post("/send-cancellation", async (req, res) => {
  const { patientName, doctorName, specialization, selectedDate, timeSlot, toEmail } = req.body;

  if (!toEmail) return res.status(400).json({ error: "Missing recipient email" });

  const mailOptions = {
    from: `"Doctor Appointment App" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Appointment Cancellation",
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2 style="color: red;">Appointment Cancelled</h2>
        <p>Dear <strong>${patientName}</strong>,</p>
        <p>Your appointment has been cancelled as per your request.</p>
        <ul>
          <li><strong>Doctor:</strong> ${doctorName}</li>
          <li><strong>Specialization:</strong> ${specialization}</li>
          <li><strong>Date:</strong> ${selectedDate}</li>
          <li><strong>Time:</strong> ${timeSlot}</li>
        </ul>
        <p>If this was a mistake, please book again through the portal.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: "Cancellation email sent" });
  } catch (err) {
    console.error("Email Error:", err);
    res.status(500).json({ error: "Failed to send cancellation email" });
  }
});

// Doctor Removal Email
router.post("/send-doctor-removal", async (req, res) => {
  const { doctorEmail, doctorName } = req.body;

  if (!doctorEmail || !doctorName) {
    return res.status(400).json({ 
      success: false,
      message: "Doctor email and name are required" 
    });
  }

  const mailOptions = {
    from: `"Doctor Appointment App" <${process.env.EMAIL_USER}>`,
    to: doctorEmail,
    subject: "Account Removal Notification",
    text: `Dear Dr. ${doctorName},\n\nWe regret to inform you that your profile has been removed from our system.\n\nIf you have any questions, please contact support.\n\nRegards,\nAdmin Team`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Removal email sent to ${doctorEmail}`);
    res.status(200).json({
      success: true,
      message: "Doctor removal email sent successfully"
    });
  } catch (err) {
    console.error("Error sending removal email:", err);
    res.status(500).json({
      success: false,
      message: "Failed to send email",
      error: err.message
    });
  }
});

// Doctor Welcome Email Route
router.post("/send-welcome", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required" });
  }

  const mailOptions = {
    from: `"Doctor Appointment App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Welcome to Doctor Appointment App",
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2 style="color: #2E86C1;">Welcome, Dr. ${name}!</h2>
        <p>Your account has been created. You can now login using the details below:</p>
        <ul>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Password:</strong> ${password}</li>
        </ul>
        <p>Thank you for joining our platform!</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: "Welcome email sent successfully" });
  } catch (err) {
    console.error("Email Error:", err);
    res.status(500).json({ error: "Failed to send welcome email" });
  }
});

// Export both router and helper function
module.exports = router;
