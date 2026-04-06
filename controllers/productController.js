const Product = require('../models/Product');
const { cloudinary } = require('../config/cloudinary');

const formatProduct = (product) => {
  const obj = product.toObject({ virtuals: true });
  return {
    _id: obj._id,
    name: obj.name,
    description: obj.description,
    category: obj.category?._id || obj.category,
    categoryName: obj.category?.name || obj.categoryName || null,
    image: obj.image,
    packagingSize: obj.packagingSize || null,
    brand: obj.brand || null,
    form: obj.form || null,
    countryOfOrigin: obj.countryOfOrigin || 'India',
    composition: obj.composition || null,
    dosage: obj.dosage || null,
    storage: obj.storage || null,
    sideEffects: obj.sideEffects || null,
    additionalDetails: obj.additionalDetails || [],
    isFeatured: obj.isFeatured || false,
    createdAt: obj.createdAt,
  };
};

const getAll = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.featured === 'true') filter.isFeatured = true;

    const products = await Product.find(filter)
      .populate('category', 'name')
      .sort({ isFeatured: -1, createdAt: -1 });

    res.json({ success: true, data: products.map(formatProduct) });
  } catch (error) { next(error); }
};

const getById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.json({ success: true, data: formatProduct(product) });
  } catch (error) { next(error); }
};

const create = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Product image is required.' });

    const { name, description, category, packagingSize, brand, form, countryOfOrigin, composition, dosage, storage, sideEffects, additionalDetails, isFeatured } = req.body;

    let parsedAdditional = [];
    if (additionalDetails) { try { parsedAdditional = JSON.parse(additionalDetails); } catch (_) {} }

    const product = await Product.create({
      name, description, category,
      image: req.file.path, imagePublicId: req.file.filename,
      packagingSize, brand, form, countryOfOrigin: countryOfOrigin || 'India',
      composition, dosage, storage, sideEffects,
      additionalDetails: parsedAdditional,
      isFeatured: isFeatured === 'true',
    });

    const populated = await product.populate('category', 'name');
    res.status(201).json({ success: true, data: formatProduct(populated) });
  } catch (error) {
    if (req.file?.filename) await cloudinary.uploader.destroy(req.file.filename).catch(() => {});
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    const { name, description, category, packagingSize, brand, form, countryOfOrigin, composition, dosage, storage, sideEffects, additionalDetails, isFeatured } = req.body;

    if (name) product.name = name;
    if (description) product.description = description;
    if (category) product.category = category;
    if (packagingSize !== undefined) product.packagingSize = packagingSize;
    if (brand !== undefined) product.brand = brand;
    if (form !== undefined) product.form = form;
    if (countryOfOrigin !== undefined) product.countryOfOrigin = countryOfOrigin;
    if (composition !== undefined) product.composition = composition;
    if (dosage !== undefined) product.dosage = dosage;
    if (storage !== undefined) product.storage = storage;
    if (sideEffects !== undefined) product.sideEffects = sideEffects;
    if (isFeatured !== undefined) product.isFeatured = isFeatured === 'true';
    if (additionalDetails !== undefined) { try { product.additionalDetails = JSON.parse(additionalDetails); } catch (_) {} }

    if (req.file) {
      if (product.imagePublicId) await cloudinary.uploader.destroy(product.imagePublicId).catch(() => {});
      product.image = req.file.path;
      product.imagePublicId = req.file.filename;
    }

    await product.save();
    const populated = await product.populate('category', 'name');
    res.json({ success: true, data: formatProduct(populated) });
  } catch (error) {
    if (req.file?.filename) await cloudinary.uploader.destroy(req.file.filename).catch(() => {});
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    if (product.imagePublicId) await cloudinary.uploader.destroy(product.imagePublicId).catch(() => {});
    res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (error) { next(error); }
};

module.exports = { getAll, getById, create, update, remove };
