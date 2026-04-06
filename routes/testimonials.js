const express = require('express');
const router = express.Router();
const { getTestimonials, getAllTestimonials, createTestimonial, updateTestimonial, deleteTestimonial, toggleVisibility } = require('../controllers/testimonialController');
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.get('/', getTestimonials);
router.get('/all', protect, getAllTestimonials);
router.post('/', protect, upload.single('image'), createTestimonial);
router.put('/:id', protect, upload.single('image'), updateTestimonial);
router.delete('/:id', protect, deleteTestimonial);
router.patch('/:id/visibility', protect, toggleVisibility);

module.exports = router;
