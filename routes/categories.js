const express = require("express");
const { upload } = require("../config/cloudinary");

const router = express.Router();
const {
  getAll,
  create,
  update,
  remove,
} = require("../controllers/categoryController");
const { protect } = require("../middleware/auth");
const {
  categoryRules,
  idParamRule,
  validate,
} = require("../middleware/validators");

// GET /api/categories  — public
router.get("/", getAll);

router.post(
  "/",
  protect,
  upload.single("image"),
  categoryRules,
  validate,
  create
);
router.put(
  "/:id",
  protect,
  upload.single("image"),
  idParamRule,
  categoryRules,
  validate,
  update
);

// DELETE /api/categories/:id  — admin only
router.delete("/:id", protect, idParamRule, validate, remove);

module.exports = router;
