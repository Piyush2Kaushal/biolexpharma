const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find admin and explicitly select password field (it's hidden by default)
    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = signToken(admin._id);

    res.json({
      success: true,
      data: {
        token,
        admin: {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/verify
const verifyToken = async (req, res, next) => {
  try {
    // req.admin is set by protect middleware
    res.json({
      success: true,
      data: {
        admin: {
          _id: req.admin._id,
          name: req.admin.name,
          email: req.admin.email,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { login, verifyToken };
