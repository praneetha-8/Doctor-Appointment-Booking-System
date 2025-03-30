require("dotenv").config(); // Load environment variables

const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "your_default_secret_key";

// Predefined admin credentials (replace with database in production)
const adminCredentials = {
  username: "admin",
  passwordHash: bcrypt.hashSync("admin123", 10) // Hashed password
};

// Admin login route
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (username === adminCredentials.username) {
    const isMatch = await bcrypt.compare(password, adminCredentials.passwordHash);

    if (isMatch) {
      // Generate JWT with admin ID
      const token = jwt.sign({ role: "admin", _id: "admin12345" }, JWT_SECRET, { expiresIn: "1h" });

      console.log("Generated Token:", token); // Debugging

      return res.status(200).json({
        success: true,
        message: "Login successful",
        token
      });
    }
  }

  res.status(401).json({
    success: false,
    message: "Invalid credentials"
  });
});

module.exports = router;
