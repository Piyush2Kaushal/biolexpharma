const express = require('express');
const router = express.Router();
const { getContent, getAllContent, updateContent, resetContent } = require('../controllers/contentController');
const { protect } = require('../middleware/auth');

// GET /api/content  — admin only
router.get('/', protect, getAllContent);

// GET /api/content/:section  — public
router.get('/:section', getContent);

// PUT /api/content/:section  — admin only
router.put('/:section', protect, updateContent);

// POST /api/content/:section/reset  — admin only
router.post('/:section/reset', protect, resetContent);

module.exports = router;
