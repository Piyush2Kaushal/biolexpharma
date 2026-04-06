const Testimonial = require('../models/Testimonial');
const cloudinary = require('../config/cloudinary');

// GET /api/testimonials — public, visible only
const getTestimonials = async (req, res, next) => {
  try {
    const testimonials = await Testimonial.find({ isVisible: true }).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: testimonials });
  } catch (error) { next(error); }
};

// GET /api/testimonials/all — admin only
const getAllTestimonials = async (req, res, next) => {
  try {
    const testimonials = await Testimonial.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: testimonials });
  } catch (error) { next(error); }
};

// POST /api/testimonials — admin only
const createTestimonial = async (req, res, next) => {
  try {
    const { text, name, designation, rating, order } = req.body;
    let imageUrl = '';
    if (req.file) {
      const result = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
        { folder: 'biolex/testimonials', transformation: [{ width: 200, height: 200, crop: 'fill' }] }
      );
      imageUrl = result.secure_url;
    }
    const testimonial = await Testimonial.create({ text, name, designation, image: imageUrl, rating: rating || 5, order: order || 0 });
    res.status(201).json({ success: true, data: testimonial, message: 'Testimonial added!' });
  } catch (error) { next(error); }
};

// PUT /api/testimonials/:id — admin only
const updateTestimonial = async (req, res, next) => {
  try {
    const { text, name, designation, rating, order, isVisible } = req.body;
    const updates = { text, name, designation, rating, order, isVisible };
    if (req.file) {
      const result = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
        { folder: 'biolex/testimonials', transformation: [{ width: 200, height: 200, crop: 'fill' }] }
      );
      updates.image = result.secure_url;
    }
    Object.keys(updates).forEach(k => updates[k] === undefined && delete updates[k]);
    const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!testimonial) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: testimonial, message: 'Testimonial updated!' });
  } catch (error) { next(error); }
};

// DELETE /api/testimonials/:id — admin only
const deleteTestimonial = async (req, res, next) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Testimonial deleted.' });
  } catch (error) { next(error); }
};

// PATCH /api/testimonials/:id/visibility — admin only
const toggleVisibility = async (req, res, next) => {
  try {
    const t = await Testimonial.findById(req.params.id);
    if (!t) return res.status(404).json({ success: false, message: 'Not found' });
    t.isVisible = !t.isVisible;
    await t.save();
    res.json({ success: true, data: t });
  } catch (error) { next(error); }
};

module.exports = { getTestimonials, getAllTestimonials, createTestimonial, updateTestimonial, deleteTestimonial, toggleVisibility };
