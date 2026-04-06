const express = require('express');
const router = express.Router();
const { create, getAll, updateStatus } = require('../controllers/inquiryController');
const { protect } = require('../middleware/auth');
const { inquiryRules, statusRules, idParamRule, validate } = require('../middleware/validators');

// POST /api/inquiries              — public
router.post('/', inquiryRules, validate, create);

// GET /api/inquiries               — admin only
router.get('/', protect, getAll);

// PATCH /api/inquiries/:id/status  — admin only
router.patch('/:id/status', protect, idParamRule, statusRules, validate, updateStatus);

module.exports = router;
