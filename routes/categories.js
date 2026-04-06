const express = require('express');
const router = express.Router();
const { getAll, create, update, remove } = require('../controllers/categoryController');
const { protect } = require('../middleware/auth');
const { categoryRules, idParamRule, validate } = require('../middleware/validators');

// GET /api/categories  — public
router.get('/', getAll);

// POST /api/categories  — admin only
router.post('/', protect, categoryRules, validate, create);

// PUT /api/categories/:id  — admin only
router.put('/:id', protect, idParamRule, categoryRules, validate, update);

// DELETE /api/categories/:id  — admin only
router.delete('/:id', protect, idParamRule, validate, remove);

module.exports = router;
