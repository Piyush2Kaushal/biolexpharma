const express = require("express");
const router = express.Router();
const { generateCatalogPDF } = require("../controllers/pdfController");

// GET /api/products/catalog/pdf           — saare products ki PDF
// GET /api/products/catalog/pdf?category=<id>  — category-wise PDF
router.get("/catalog/pdf", generateCatalogPDF);

module.exports = router;
