const Inquiry = require('../models/Inquiry');

// Helper: format inquiry with productName
const formatInquiry = (inquiry) => {
  const obj = inquiry.toObject({ virtuals: true });
  return {
    _id: obj._id,
    name: obj.name,
    email: obj.email,
    phone: obj.phone,
    company: obj.company || null,
    quantity: obj.quantity || null,
    message: obj.message,
    productId: obj.productId?._id || obj.productId || null,
    productName: obj.productId?.name || null,
    status: obj.status,
    createdAt: obj.createdAt,
  };
};

// POST /api/inquiries  (public)
const create = async (req, res, next) => {
  try {
    const { name, email, phone, company, quantity, message, productId } = req.body;

    const inquiry = await Inquiry.create({
      name,
      email,
      phone,
      company: company || undefined,
      quantity: quantity || undefined,
      message,
      productId: productId || null,
    });

    res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully. We will contact you soon.',
      data: inquiry,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/inquiries  (admin only)
const getAll = async (req, res, next) => {
  try {
    const inquiries = await Inquiry.find()
      .populate('productId', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: inquiries.map(formatInquiry) });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/inquiries/:id/status  (admin only)
const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('productId', 'name');

    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found.' });
    }

    res.json({ success: true, data: formatInquiry(inquiry) });
  } catch (error) {
    next(error);
  }
};

module.exports = { create, getAll, updateStatus };
