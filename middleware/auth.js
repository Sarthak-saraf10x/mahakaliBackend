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
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
  }
};

const adminOnly = (req, res, next) => {
  const allowedAdminsStr = process.env.ADMIN_EMAILS || 'admin@mahakalitours.com,sarthaksaraf10@gmail.com,gotosarthaks@gmail.com,mahakalitravels.9037@gmail.com,mahakalitravels9037@gmail.com';
  const allowedAdmins = allowedAdminsStr.split(',').map(e => e.trim().toLowerCase());

  const isAdmin = req.user && (
    req.user.role === 'admin' ||
    req.user.isAdmin === true ||
    (req.user.email && allowedAdmins.includes(req.user.email.toLowerCase()))
  );

  if (isAdmin) {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Access Denied: Admin privileges required.' });
  }
};

module.exports = { protect, adminOnly };

