const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access Denied: No authentication token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mahakali_super_secret_jwt_key_2026_nagpur');

    // Attach decoded user info
    req.user = decoded;

    // Check if admin email list check is required
    const allowedAdmins = (process.env.ADMIN_EMAILS || 'admin@mahakalitours.com,sarthaksaraf10@gmail.com,mahakalitravels.9037@gmail.com')
      .split(',')
      .map(e => e.trim().toLowerCase());

    if (decoded.email && !allowedAdmins.includes(decoded.email.toLowerCase()) && decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access Denied: Unauthorized admin account.' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.isAdmin)) {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Access Denied: Admin privileges required.' });
  }
};

module.exports = { protect, adminOnly };
