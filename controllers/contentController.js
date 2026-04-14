const SiteContent = require("../models/SiteContent");

// GET /api/content/:section  — public
const getContent = async (req, res, next) => {
  try {
    const { section } = req.params;
    if (!["home", "about", "contact", "settings"].includes(section)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid section." });
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
    const sections = ["home", "about", "contact", "settings"];
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
    if (!["home", "about", "contact", "settings"].includes(section)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid section." });
    }

    const { content } = req.body;
    if (!content || typeof content !== "object") {
      return res
        .status(400)
        .json({ success: false, message: "Content object is required." });
    }

    // Get existing content and merge (partial updates allowed)
    const existing = await SiteContent.getContent(section);
    const merged = { ...existing, ...content };

    await SiteContent.findOneAndUpdate(
      { section },
      { content: merged },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      data: merged,
      message: `${section} content updated successfully!`,
    });
  } catch (error) {
    next(error);
  }
};

const uploadHeroImage = async (req, res, next) => {
  try {
    if (!req.file)
      return res
        .status(400)
        .json({ success: false, message: "No image uploaded." });

    // multer-storage-cloudinary already uploaded the file.
    // req.file.path is the secure Cloudinary URL.
    const heroImageUrl = req.file.path;

    const existing = await SiteContent.getContent("home");
    const merged = { ...existing, heroImage: heroImageUrl };
    await SiteContent.findOneAndUpdate(
      { section: "home" },
      { content: merged },
      { upsert: true }
    );

    res.json({
      success: true,
      data: { heroImage: heroImageUrl },
      message: "Hero image uploaded!",
    });
  } catch (error) {
    next(error);
  }
};

const deleteHeroImage = async (req, res, next) => {
  try {
    const existing = await SiteContent.getContent("home");
    const merged = { ...existing, heroImage: "" };
    await SiteContent.findOneAndUpdate(
      { section: "home" },
      { content: merged },
      { upsert: true }
    );
    res.json({ success: true, message: "Hero image removed." });
  } catch (error) {
    next(error);
  }
};
// POST /api/content/home/banner-images — admin only, add a banner image (max 5)
const uploadBannerImage = async (req, res, next) => {
  try {
    if (!req.file)
      return res
        .status(400)
        .json({ success: false, message: "No image uploaded." });

    const existing = await SiteContent.getContent("home");
    const bannerImages = Array.isArray(existing.bannerImages)
      ? existing.bannerImages
      : [];

    if (bannerImages.length >= 5)
      return res
        .status(400)
        .json({ success: false, message: "Maximum 5 banner images allowed." });

    bannerImages.push(req.file.path);
    const merged = { ...existing, bannerImages };
    await SiteContent.findOneAndUpdate(
      { section: "home" },
      { content: merged },
      { upsert: true }
    );

    res.json({
      success: true,
      data: { bannerImages },
      message: "Banner image uploaded!",
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/content/home/banner-images/:index — admin only, remove a banner image by index
const deleteBannerImage = async (req, res, next) => {
  try {
    const index = parseInt(req.params.index, 10);
    const existing = await SiteContent.getContent("home");
    const bannerImages = Array.isArray(existing.bannerImages)
      ? [...existing.bannerImages]
      : [];

    if (isNaN(index) || index < 0 || index >= bannerImages.length)
      return res
        .status(400)
        .json({ success: false, message: "Invalid index." });

    bannerImages.splice(index, 1);
    const merged = { ...existing, bannerImages };
    await SiteContent.findOneAndUpdate(
      { section: "home" },
      { content: merged },
      { upsert: true }
    );

    res.json({
      success: true,
      data: { bannerImages },
      message: "Banner image removed.",
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/content/:section/reset  — admin only, reset to defaults
const resetContent = async (req, res, next) => {
  try {
    const { section } = req.params;
    if (!["home", "about", "contact", "settings"].includes(section)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid section." });
    }

    const defaults = SiteContent.defaultContent[section];
    await SiteContent.findOneAndUpdate(
      { section },
      { content: defaults },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      data: defaults,
      message: `${section} content reset to defaults.`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getContent,
  getAllContent,
  updateContent,
  resetContent,
  uploadHeroImage,
  deleteHeroImage,
  uploadBannerImage,
  deleteBannerImage,
};
