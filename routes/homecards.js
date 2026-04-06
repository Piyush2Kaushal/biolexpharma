const express = require('express');
const router = express.Router();
const { getCards, getAllCards, createCard, updateCard, deleteCard, resetCards } = require('../controllers/homeCardController');
const { protect } = require('../middleware/auth');

router.get('/:section', getCards);
router.get('/:section/all', protect, getAllCards);
router.post('/:section', protect, createCard);
router.put('/:id', protect, updateCard);
router.delete('/:id', protect, deleteCard);
router.post('/:section/reset', protect, resetCards);

module.exports = router;
