const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
require("dotenv").config();

router.post("/send-confirmation", async (req, res) => {
  const { patientName, doctorName, specialization, selectedDate, timeSlot, toEmail } = req.body;

  if (!toEmail) return res.status(400).json({ error: "Missing recipient email" });

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

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

    await transporter.sendMail(mailOptions);
    res.json({ message: "Confirmation email sent" });
  } catch (err) {
    console.error("Email Error:", err);
    res.status(500).json({ error: "Failed to send email" });
  }
});



router.post("/send-cancellation", async (req, res) => {
  console.log(req.body);
  const { patientName, doctorName, specialization, selectedDate, timeSlot, toEmail } = req.body;

  if (!toEmail) return res.status(400).json({ error: "Missing recipient email" });

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

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
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "Cancellation email sent" });
  } catch (err) {
    console.error("Email Error:", err);
    res.status(500).json({ error: "Failed to send cancellation email" });
  }
});


module.exports = router;
