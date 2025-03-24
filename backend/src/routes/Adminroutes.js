const express = require('express');
const router = express.Router();

// Predefined admin credentials
const adminCredentials = {
  username: "admin",
  password: "admin123"
};

// Login route
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === adminCredentials.username && password === adminCredentials.password) {
    res.status(200).json({
      success: true,
      message: "Login successful",
      username: username
    });
  } else {
    res.status(401).json({
      success: false,
      message: "Invalid credentials"
    });
  }
});


module.exports = router;