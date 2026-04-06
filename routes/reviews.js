const express = require('express');
const router = express.Router();
const { getByProduct, getAll, create, remove, toggleVisibility } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

// GET /api/reviews?product=<id>  — public
router.get('/', getByProduct);

// GET /api/reviews/all  — admin only
router.get('/all', protect, getAll);

// POST /api/reviews  — public
router.post('/', create);

// DELETE /api/reviews/:id  — admin only
router.delete('/:id', protect, remove);

// PATCH /api/reviews/:id/visibility  — admin only
router.patch('/:id/visibility', protect, toggleVisibility);

module.exports = router;
