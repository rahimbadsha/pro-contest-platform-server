const jwt = require('jsonwebtoken');
const User = require('../models/User'); 

// verifyToken: Authorization: Bearer <token>
exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    // decoded = { id: ..., role: ..., iat: ..., exp: ... }
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
};

// authorizeRoles(...roles) -> middleware
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
    }
    next();
  };
};
