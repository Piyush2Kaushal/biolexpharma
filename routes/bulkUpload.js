const express = require("express");
const router = express.Router();
const multer = require("multer");
const { protect } = require("../middleware/auth");
const {
  bulkUpload,
  bulkUploadCategories,
} = require("../controllers/bulkUploadController");

// Store file in memory (no disk, no Cloudinary — we only parse it)
const memoryStorage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
      "text/csv", // .csv
      "application/csv",
    ];
    // Also check extension as some browsers send wrong MIME
    const ext = file.originalname.split(".").pop().toLowerCase();
    if (
      allowed.includes(file.mimetype) ||
      ["xlsx", "xls", "csv"].includes(ext)
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only Excel (.xlsx, .xls) or CSV files are allowed"), false);
    }
  },
});

// POST /api/bulk-upload/products  — admin only
router.post("/products", protect, memoryStorage.single("file"), bulkUpload);

// POST /api/bulk-upload/categories  — admin only
router.post(
  "/categories",
  protect,
  memoryStorage.single("file"),
  bulkUploadCategories
);

module.exports = router;
