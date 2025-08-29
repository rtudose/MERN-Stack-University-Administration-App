// middleware/authorize.js
module.exports = function(roles = []) {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ msg: 'No authorization data found' });
    }

    if (roles.length && !roles.includes(req.user.role.trim())) {
      return res.status(403).json({ msg: 'Access denied: You do not have the required role' });
    }

    next();
  };
};