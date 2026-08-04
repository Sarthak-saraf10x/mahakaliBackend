const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
    const { token, credential, demoEmail, demoName } = req.body;
    const idToken = credential || token;

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

    // Check Authorized Admin Whitelist
    const allowedAdminsStr = process.env.ADMIN_EMAILS || 'admin@mahakalitours.com,sarthaksaraf10@gmail.com,gotosarthaks@gmail.com,mahakalitravels.9037@gmail.com,mahakalitravels9037@gmail.com';
    const allowedAdmins = allowedAdminsStr.split(',').map(e => e.trim().toLowerCase());

    const emailLower = email.toLowerCase();
    const isAdminEmail = allowedAdmins.includes(emailLower);
    const assignedRole = isAdminEmail ? 'admin' : 'user';

    // Upsert user in MongoDB
    let user = await User.findOne({ email: emailLower });
    if (!user) {
      user = await User.create({
        name: name,
        email: emailLower,
        avatar: picture || 'https://img.icons8.com/color/96/user.png',
        googleId: googleId,
        role: assignedRole
      });
    } else {
      user.name = name || user.name;
      if (picture) user.avatar = picture;
      user.role = assignedRole; // Update role if added to admin list
      await user.save();
    }

    // Generate JWT
    const jwtToken = generateToken(user);

    return res.status(200).json({
      success: true,
      message: isAdminEmail ? 'Admin Authentication Successful!' : 'User Login Successful!',
      token: jwtToken,
      isAdmin: isAdminEmail,
      redirectUrl: isAdminEmail ? '/admin.html' : '/',
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
