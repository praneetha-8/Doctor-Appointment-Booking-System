const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || "your_default_secret_key"; // Ensure this is set

const verifyToken = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), JWT_SECRET);
    req.user = decoded; // Store the decoded token in req.user
    next();
  } catch (error) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }
};

module.exports = verifyToken;