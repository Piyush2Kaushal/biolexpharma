const express = require('express');
const router = express.Router();
const { login, verifyToken } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { loginRules, validate } = require('../middleware/validators');

// POST /api/auth/login
router.post('/login', loginRules, validate, login);

// GET /api/auth/verify
router.get('/verify', protect, verifyToken);

module.exports = router;
