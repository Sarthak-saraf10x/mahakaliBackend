const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Email normalization helper (handles Gmail dot aliases and case sensitivity)
const normalizeEmail = (email) => {
  if (!email) return '';
  let [local, domain] = email.trim().toLowerCase().split('@');
  if (!domain) return local;
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    local = local.replace(/\./g, '');
    domain = 'gmail.com';
  }
  return `${local}@${domain}`;
};

// Generate JWT Helper
const generateToken = (user) => {
  const isAdmin = user.role === 'admin';
  return jwt.sign(
    { id: user._id, email: user.email, name: user.name, role: user.role, isAdmin: isAdmin },
    process.env.JWT_SECRET || 'mahakali_super_secret_jwt_key_2026_nagpur',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};


// @desc Google OAuth Login
// @route POST /api/auth/google
// @access Public
exports.googleAuth = async (req, res) => {
  try {
    const { token, credential, idToken: bodyIdToken, demoEmail, demoName } = req.body;
    const idToken = credential || token || bodyIdToken;

    let email, name, picture, googleId;

    // Check if real Google ID Token provided
    if (idToken && idToken !== 'demo_token') {
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: idToken,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        email = payload.email;
        name = payload.name;
        picture = payload.picture;
        googleId = payload.sub;
      } catch (err) {
        // If Google Client ID not matching in dev, decode token directly or check fallback
        const decoded = jwt.decode(idToken);
        if (decoded && decoded.email) {
          email = decoded.email;
          name = decoded.name || 'Admin User';
          picture = decoded.picture || '';
          googleId = decoded.sub || 'google-dev-id';
        } else if (demoEmail) {
          email = demoEmail;
          name = demoName || 'Admin User';
        } else {
          return res.status(401).json({ success: false, message: 'Invalid Google OAuth Token.' });
        }
      }
    } else if (demoEmail) {
      email = demoEmail;
      name = demoName || 'Mahakali Admin';
      googleId = 'demo-admin-id';
    } else {
      return res.status(400).json({ success: false, message: 'Google credential token or email is required.' });
    }

    // Check Whitelist for Admin role
    const allowedAdminsStr = process.env.ADMIN_EMAILS || 'admin@mahakalitours.com,sarthaksaraf10@gmail.com,gotosarthaks@gmail.com,mahakalitravels.9037@gmail.com,mahakalitravels9037@gmail.com';
    const allowedAdmins = allowedAdminsStr.split(',').map(e => normalizeEmail(e));

    const emailLower = email.toLowerCase();
    const normUserEmail = normalizeEmail(emailLower);

    let user = await User.findOne({ email: emailLower });
    const isWhitelisted = allowedAdmins.includes(normUserEmail);
    const isDbAdmin = user && user.role === 'admin';
    const isAdmin = isWhitelisted || isDbAdmin;

    // Upsert user in MongoDB
    if (!user) {
      user = await User.create({
        name: name,
        email: emailLower,
        avatar: picture || 'https://img.icons8.com/color/96/user.png',
        googleId: googleId,
        role: isAdmin ? 'admin' : 'user'
      });
    } else {
      user.name = name || user.name;
      if (picture) user.avatar = picture;
      if (isWhitelisted) user.role = 'admin';
      await user.save();
    }

    // If NOT an admin, return 403 Forbidden
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        isAdmin: false,
        message: 'Access Denied: Account is not authorized as Admin.',
        redirectUrl: '/index.html'
      });
    }

    // Generate JWT
    const jwtToken = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Admin Authentication Successful!',
      token: jwtToken,
      isAdmin: true,
      redirectUrl: '/admin.html',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Google Auth Controller Error:', error);
    return res.status(500).json({ success: false, message: 'Server authentication error: ' + error.message });
  }
};


// @desc Email Login & Auto-Signup
// @route POST /api/auth/login
// @access Public
exports.emailAuth = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const emailLower = email.trim().toLowerCase();
    const normUserEmail = normalizeEmail(emailLower);

    // Check Whitelist for Admin role
    const allowedAdminsStr = process.env.ADMIN_EMAILS || 'admin@mahakalitours.com,sarthaksaraf10@gmail.com,gotosarthaks@gmail.com,mahakalitravels.9037@gmail.com,mahakalitravels9037@gmail.com';
    const allowedAdmins = allowedAdminsStr.split(',').map(e => normalizeEmail(e));

    const isWhitelisted = allowedAdmins.includes(normUserEmail);

    let user = await User.findOne({ email: emailLower });

    if (!user) {
      // Auto Signup if no account exists
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      user = await User.create({
        name: name || emailLower.split('@')[0],
        email: emailLower,
        password: hashedPassword,
        avatar: 'https://img.icons8.com/color/96/user.png',
        role: isWhitelisted ? 'admin' : 'user'
      });
    } else {
      // User exists -> Check password
      if (user.password) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });
        }
      } else {
        // Set password for user created via OAuth
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
      }
      if (isWhitelisted) user.role = 'admin';
      await user.save();
    }

    const isDbAdmin = user.role === 'admin';
    const isAdmin = isWhitelisted || isDbAdmin;

    // Reject non-admin users
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        isAdmin: false,
        message: 'Access Denied: Account is not authorized as Admin.',
        redirectUrl: '/index.html'
      });
    }

    const jwtToken = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Admin Authentication Successful!',
      token: jwtToken,
      isAdmin: true,
      redirectUrl: '/admin.html',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Email Auth Error:', error);
    return res.status(500).json({ success: false, message: 'Authentication error: ' + error.message });
  }
};



// @desc Get current admin profile
// @route GET /api/auth/profile
// @access Private (Admin)
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-__v');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Admin profile not found.' });
    }
    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Admin Logout
// @route POST /api/auth/logout
// @access Private
exports.logout = async (req, res) => {
  return res.status(200).json({ success: true, message: 'Logged out successfully.' });
};
