const Category = require('../models/Category');

// GET /api/categories
const getAll = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

// POST /api/categories  (admin only)
const create = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const category = await Category.create({ name, description });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

// PUT /api/categories/:id  (admin only)
const update = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/categories/:id  (admin only)
const remove = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }
    res.json({ success: true, message: 'Category deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, create, update, remove };
