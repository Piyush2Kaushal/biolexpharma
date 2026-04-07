const express = require("express");
const router = express.Router();
const {
  getAll,
  getById,
  create,
  update,
  remove,
  bulkDelete,
} = require("../controllers/productController");
const { protect } = require("../middleware/auth");
const {
  productRules,
  idParamRule,
  validate,
} = require("../middleware/validators");
const { upload } = require("../config/cloudinary");

// DELETE /api/products/bulk  — admin only, bulk delete by ids
router.delete("/bulk", protect, bulkDelete);

// GET /api/products          — public (optional ?category=<id>)
router.get("/", getAll);

// GET /api/products/:id      — public
router.get("/:id", idParamRule, validate, getById);

// POST /api/products         — admin only, with image upload
router.post(
  "/",
  protect,
  upload.single("image"),
  productRules,
  validate,
  create
);

// PUT /api/products/:id      — admin only, optional image replacement
router.put(
  "/:id",
  protect,
  upload.single("image"),
  idParamRule,
  validate,
  update
);

// DELETE /api/products/:id   — admin only
router.delete("/:id", protect, idParamRule, validate, remove);

module.exports = router;
