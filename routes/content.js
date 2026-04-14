// REPLACE entire file:
const express = require("express");
const router = express.Router();
const {
  getContent,
  getAllContent,
  updateContent,
  resetContent,
  uploadHeroImage,
  deleteHeroImage,
  uploadBannerImage,
  deleteBannerImage,
} = require("../controllers/contentController");
const { protect } = require("../middleware/auth");
const { upload } = require("../config/cloudinary");

router.get("/", protect, getAllContent);
router.get("/:section", getContent);
router.put("/:section", protect, updateContent);
router.post("/:section/reset", protect, resetContent);

// Hero image upload/delete
router.post(
  "/home/hero-image",
  protect,
  upload.single("image"),
  uploadHeroImage
);
router.delete("/home/hero-image", protect, deleteHeroImage);

// Banner images upload/delete
router.post(
  "/home/banner-images",
  protect,
  upload.single("image"),
  uploadBannerImage
);
router.delete("/home/banner-images/:index", protect, deleteBannerImage);

module.exports = router;
