const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  getTestimonials,
  getAllTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  toggleVisibility,
} = require("../controllers/testimonialController");
const { protect } = require("../middleware/auth");

// Memory storage — controller manually uploads to Cloudinary using buffer
const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"), false);
  },
});

router.get("/", getTestimonials);
router.get("/all", protect, getAllTestimonials);
router.post("/", protect, memoryUpload.single("image"), createTestimonial);
router.put("/:id", protect, memoryUpload.single("image"), updateTestimonial);
router.delete("/:id", protect, deleteTestimonial);
router.patch("/:id/visibility", protect, toggleVisibility);

module.exports = router;
