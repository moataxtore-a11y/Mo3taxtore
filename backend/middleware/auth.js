const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - require authentication
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;

    // Asynchronously update lastActive without blocking the request (buffer 60 seconds)
    if (!user.lastActive || Date.now() - new Date(user.lastActive).getTime() > 60000) {
      User.updateOne({ _id: user._id }, { lastActive: new Date() }).exec().catch(err => console.error('Error updating lastActive:', err));
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token invalid' });
  }
};

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req || !req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Your role is not authorized to access this resource`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
