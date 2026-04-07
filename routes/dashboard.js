const express = require("express");
const router = express.Router();
const {
  getStats,
  getMostViewed,
  getMostRequested,
} = require("../controllers/dashboardController");
const { protect } = require("../middleware/auth");

// All dashboard routes are admin-only
router.get("/stats", protect, getStats);
router.get("/most-viewed", protect, getMostViewed);
router.get("/most-requested", protect, getMostRequested);

module.exports = router;
