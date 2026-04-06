const SiteContent = require('../models/SiteContent');

// GET /api/content/:section  — public
const getContent = async (req, res, next) => {
  try {
    const { section } = req.params;
    if (!['home', 'about', 'contact'].includes(section)) {
      return res.status(400).json({ success: false, message: 'Invalid section.' });
    }

    const content = await SiteContent.getContent(section);
    res.json({ success: true, data: content });
  } catch (error) {
    next(error);
  }
};

// GET /api/content  — admin only, get all sections
const getAllContent = async (req, res, next) => {
  try {
    const sections = ['home', 'about', 'contact'];
    const result = {};

    for (const section of sections) {
      result[section] = await SiteContent.getContent(section);
    }

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// PUT /api/content/:section  — admin only, update content
const updateContent = async (req, res, next) => {
  try {
    const { section } = req.params;
    if (!['home', 'about', 'contact'].includes(section)) {
      return res.status(400).json({ success: false, message: 'Invalid section.' });
    }

    const { content } = req.body;
    if (!content || typeof content !== 'object') {
      return res.status(400).json({ success: false, message: 'Content object is required.' });
    }

    // Get existing content and merge (partial updates allowed)
    const existing = await SiteContent.getContent(section);
    const merged = { ...existing, ...content };

    await SiteContent.findOneAndUpdate(
      { section },
      { content: merged },
      { upsert: true, new: true }
    );

    res.json({ success: true, data: merged, message: `${section} content updated successfully!` });
  } catch (error) {
    next(error);
  }
};

// POST /api/content/:section/reset  — admin only, reset to defaults
const resetContent = async (req, res, next) => {
  try {
    const { section } = req.params;
    if (!['home', 'about', 'contact'].includes(section)) {
      return res.status(400).json({ success: false, message: 'Invalid section.' });
    }

    const defaults = SiteContent.defaultContent[section];
    await SiteContent.findOneAndUpdate(
      { section },
      { content: defaults },
      { upsert: true, new: true }
    );

    res.json({ success: true, data: defaults, message: `${section} content reset to defaults.` });
  } catch (error) {
    next(error);
  }
};

module.exports = { getContent, getAllContent, updateContent, resetContent };
