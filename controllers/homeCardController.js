const HomeCard = require('../models/HomeCard');

const DEFAULT_CARDS = {
  features: [
    { icon: 'Shield', title: 'ISO 9001:2015 Certified', description: 'Quality assured pharmaceutical products meeting international standards', color: 'blue', order: 0 },
    { icon: 'Package', title: 'Wide Product Range', description: 'Comprehensive selection across all therapeutic categories', color: 'emerald', order: 1 },
    { icon: 'Clock', title: 'On-Time Delivery', description: 'Reliable and timely delivery to ensure continuous supply', color: 'orange', order: 2 },
    { icon: 'Users', title: 'B2B Focused', description: 'Specialized service for wholesalers, distributors and professionals', color: 'purple', order: 3 },
  ],
  why_us: [
    { icon: 'BadgeCheck', title: 'ISO 9001:2015 Certified', description: 'Full certification ensuring every product meets international quality benchmarks.', color: 'blue', order: 0 },
    { icon: 'Truck', title: 'On-Time Delivery', description: 'Reliable logistics ensuring your supplies reach you exactly when needed.', color: 'emerald', order: 1 },
    { icon: 'ThumbsUp', title: 'Competitive Pricing', description: 'Best wholesale prices with no compromise on product quality or authenticity.', color: 'orange', order: 2 },
    { icon: 'Shield', title: 'Quality Assurance', description: 'Every medicine verified and sourced from trusted manufacturers across India.', color: 'blue', order: 3 },
    { icon: 'Users', title: 'Dedicated Support', description: 'Our team is always available to help with inquiries and after-sales support.', color: 'purple', order: 4 },
    { icon: 'Globe', title: 'Pan-India Network', description: 'Established distribution network covering all major states and cities in India.', color: 'teal', order: 5 },
  ],
  highlights: [
    { icon: 'BadgeCheck', title: 'ISO 9001:2015', description: 'Quality Management System Certified', color: 'blue', order: 0 },
    { icon: 'Shield', title: 'DCGI Compliant', description: 'Drug Controller Approved Products', color: 'green', order: 1 },
    { icon: 'Award', title: 'GMP Certified', description: 'Good Manufacturing Practices', color: 'purple', order: 2 },
    { icon: 'CheckCircle', title: 'GST Registered', description: 'No. 04AAJCB2451N1ZM', color: 'orange', order: 3 },
  ],
};

// GET /api/homecards/:section — public
const getCards = async (req, res, next) => {
  try {
    const { section } = req.params;
    if (!['features', 'why_us', 'highlights'].includes(section)) {
      return res.status(400).json({ success: false, message: 'Invalid section' });
    }
    let cards = await HomeCard.find({ section, isVisible: true }).sort({ order: 1, createdAt: 1 });
    // Seed defaults if empty
    if (cards.length === 0) {
      await HomeCard.insertMany(DEFAULT_CARDS[section].map(c => ({ ...c, section })));
      cards = await HomeCard.find({ section, isVisible: true }).sort({ order: 1 });
    }
    res.json({ success: true, data: cards });
  } catch (error) { next(error); }
};

// GET /api/homecards/:section/all — admin
const getAllCards = async (req, res, next) => {
  try {
    const { section } = req.params;
    const cards = await HomeCard.find({ section }).sort({ order: 1, createdAt: 1 });
    res.json({ success: true, data: cards });
  } catch (error) { next(error); }
};

// POST /api/homecards/:section — admin
const createCard = async (req, res, next) => {
  try {
    const { section } = req.params;
    const { icon, title, description, color, order } = req.body;
    const card = await HomeCard.create({ section, icon, title, description, color, order: order || 0 });
    res.status(201).json({ success: true, data: card, message: 'Card added!' });
  } catch (error) { next(error); }
};

// PUT /api/homecards/:id — admin
const updateCard = async (req, res, next) => {
  try {
    const { icon, title, description, color, order, isVisible } = req.body;
    const updates = { icon, title, description, color, order, isVisible };
    Object.keys(updates).forEach(k => updates[k] === undefined && delete updates[k]);
    const card = await HomeCard.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!card) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: card, message: 'Card updated!' });
  } catch (error) { next(error); }
};

// DELETE /api/homecards/:id — admin
const deleteCard = async (req, res, next) => {
  try {
    await HomeCard.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Card deleted.' });
  } catch (error) { next(error); }
};

// POST /api/homecards/:section/reset — admin
const resetCards = async (req, res, next) => {
  try {
    const { section } = req.params;
    await HomeCard.deleteMany({ section });
    await HomeCard.insertMany(DEFAULT_CARDS[section].map(c => ({ ...c, section })));
    const cards = await HomeCard.find({ section }).sort({ order: 1 });
    res.json({ success: true, data: cards, message: 'Cards reset to defaults.' });
  } catch (error) { next(error); }
};

module.exports = { getCards, getAllCards, createCard, updateCard, deleteCard, resetCards };
