// middleware/authorize.js
module.exports = function(roles = []) {
  // roles can be a single role string (e.g., 'admin') or an array of roles (e.g., ['admin', 'student'])
  if (typeof roles === 'string') {
    roles = [roles]; // Ensure it's an array
  }

  return (req, res, next) => {
    // req.user is populated by the auth middleware
    if (!req.user || !req.user.role) {
      return res.status(401).json({ msg: 'No authorization data found' });
    }

    // Check if the user's role is included in the allowed roles
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ msg: 'Access denied: You do not have the required role' });
    }

    next(); // User is authorized, proceed
  };
};