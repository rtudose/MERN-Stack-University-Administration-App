// middleware/auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Ensure JWT_SECRET is loaded

module.exports = function(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token'); // Common header name for tokens

  // Check if not token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user; // Attach user payload (id, role) to the request object
    next(); // Move to the next middleware/route handler
  } catch (err) {
    console.error('Token verification failed:', err.name);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};