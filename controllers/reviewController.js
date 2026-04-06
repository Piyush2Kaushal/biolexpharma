const Review = require('../models/Review');
const Product = require('../models/Product');

// GET /api/reviews?product=<id>  — public, get reviews for a product
const getByProduct = async (req, res, next) => {
  try {
    const { product } = req.query;
    if (!product) {
      return res.status(400).json({ success: false, message: 'Product ID is required.' });
    }

    const reviews = await Review.find({ product, isVisible: true }).sort({ createdAt: -1 });

    // Compute average rating
    const all = await Review.find({ product, isVisible: true });
    const avgRating =
      all.length > 0
        ? parseFloat((all.reduce((sum, r) => sum + r.rating, 0) / all.length).toFixed(1))
        : 0;

    res.json({ success: true, data: reviews, avgRating, totalReviews: all.length });
  } catch (error) {
    next(error);
  }
};

// GET /api/reviews/all  — admin only, get all reviews
const getAll = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate('product', 'name image')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

// POST /api/reviews  — public, submit a review
const create = async (req, res, next) => {
  try {
    const { product, name, email, rating, message } = req.body;

    // Validate product exists
    const productDoc = await Product.findById(product);
    if (!productDoc) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Check if the same email already reviewed this product
    const existing = await Review.findOne({ product, email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this product.',
      });
    }

    const review = await Review.create({ product, name, email, rating, message });
    res.status(201).json({ success: true, data: review, message: 'Review submitted successfully!' });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/reviews/:id  — admin only
const remove = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }
    res.json({ success: true, message: 'Review deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/reviews/:id/visibility  — admin only, toggle visibility
const toggleVisibility = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }
    review.isVisible = !review.isVisible;
    await review.save();
    res.json({ success: true, data: review, message: `Review ${review.isVisible ? 'shown' : 'hidden'} successfully.` });
  } catch (error) {
    next(error);
  }
};

module.exports = { getByProduct, getAll, create, remove, toggleVisibility };
