const Category = require("../models/Category");

// GET /api/categories
const getAll = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 }).lean();
    // Categories change rarely — cache for 60s in browser, 120s in CDN/proxy
    res.set("Cache-Control", "public, max-age=60, s-maxage=120");
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

// REPLACE create function:
const create = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    let imageUrl = "";
    if (req.file) {
      // multer-storage-cloudinary already uploads to Cloudinary
      // req.file.path contains the secure Cloudinary URL
      imageUrl = req.file.path;
    }
    const category = await Category.create({
      name,
      description,
      image: imageUrl,
    });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

// REPLACE update function:
const update = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const updates = { name, description };
    if (req.file) {
      // multer-storage-cloudinary already uploads to Cloudinary
      // req.file.path contains the secure Cloudinary URL
      updates.image = req.file.path;
    }
    const category = await Category.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!category)
      return res
        .status(404)
        .json({ success: false, message: "Category not found." });
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
      return res
        .status(404)
        .json({ success: false, message: "Category not found." });
    }
    res.json({ success: true, message: "Category deleted successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, create, update, remove };
