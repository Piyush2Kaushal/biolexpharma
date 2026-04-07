"use strict";

const PDFDocument = require("pdfkit");
const axios = require("axios");
const Product = require("../models/Product");
const Category = require("../models/Category");
const SiteContent = require("../models/SiteContent");

// ─────────────────────────────────────────────────────────────────────────────
// Design tokens
// ─────────────────────────────────────────────────────────────────────────────
const C = {
  primary: "#1E40AF",
  secondary: "#3B82F6",
  accent: "#DBEAFE",
  dark: "#1E293B",
  muted: "#64748B",
  light: "#F8FAFC",
  border: "#E2E8F0",
  white: "#FFFFFF",
  green: "#059669",
};

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 36;
const CONTENT_W = PAGE_W - MARGIN * 2;
const FOOTER_H = 68;
const USABLE_BOT = PAGE_H - FOOTER_H - 10;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
async function fetchImageBuffer(url) {
  try {
    const r = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: 8000,
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    return Buffer.from(r.data);
  } catch {
    return null;
  }
}

function rRect(doc, x, y, w, h, r, fill, stroke) {
  doc.save();
  doc.roundedRect(x, y, w, h, r);
  if (fill && stroke) {
    doc.fillColor(fill).strokeColor(stroke).lineWidth(0.5).fillAndStroke();
  } else if (fill) {
    doc.fillColor(fill).fill();
  } else if (stroke) {
    doc.strokeColor(stroke).lineWidth(0.5).stroke();
  }
  doc.restore();
}

// ── Footer drawn at bottom of every page ─────────────────────────────────────
function drawFooter(doc, company) {
  const y = PAGE_H - FOOTER_H;
  doc.rect(0, y, PAGE_W, FOOTER_H).fill(C.dark);
  doc.rect(0, y, PAGE_W, 3).fill(C.secondary);

  doc
    .fillColor(C.white)
    .font("Helvetica-Bold")
    .fontSize(9)
    .text(company.name.toUpperCase(), MARGIN, y + 10, {
      width: CONTENT_W,
      align: "center",
    });

  doc
    .fillColor("#CBD5E1")
    .font("Helvetica")
    .fontSize(7.5)
    .text(company.address, MARGIN, y + 25, {
      width: CONTENT_W,
      align: "center",
    });

  doc
    .fillColor("#CBD5E1")
    .font("Helvetica")
    .fontSize(7.5)
    .text(
      `Ph: ${company.phone}   |   ${company.email}   |   ${company.businessHours}`,
      MARGIN,
      y + 37,
      { width: CONTENT_W, align: "center" }
    );

  doc
    .fillColor("#94A3B8")
    .font("Helvetica")
    .fontSize(7)
    .text(
      `GSTIN: ${company.gstin}   \u2022   CIN: ${company.cin}`,
      MARGIN,
      y + 51,
      { width: CONTENT_W, align: "center" }
    );
}

// ── Thin accent strip on top of continuation pages ───────────────────────────
function drawPageTop(doc) {
  doc.rect(0, 0, PAGE_W, 6).fill(C.primary);
}

// ── Cover Page ────────────────────────────────────────────────────────────────
function drawCoverPage(doc, company, title, subtitle, totalProducts) {
  // Full blue header
  doc.rect(0, 0, PAGE_W, 180).fill(C.primary);
  doc.rect(0, 148, PAGE_W, 32).fill(C.secondary);

  // Decorative circles
  doc
    .save()
    .circle(PAGE_W - 30, -20, 100)
    .fillOpacity(0.07)
    .fill(C.white)
    .restore();
  doc.save().circle(30, 160, 50).fillOpacity(0.06).fill(C.white).restore();

  // Company name
  doc
    .fillColor(C.white)
    .font("Helvetica-Bold")
    .fontSize(22)
    .text("BIOLEX PHARMACEUTICAL", MARGIN, 28, { width: CONTENT_W - 150 });
  doc
    .fillColor("#BFDBFE")
    .font("Helvetica")
    .fontSize(10)
    .text("Private Limited", MARGIN, 54, { width: CONTENT_W - 150 });
  doc
    .fillColor("#93C5FD")
    .font("Helvetica")
    .fontSize(8.5)
    .text(company.certification, MARGIN, 68, { width: CONTENT_W - 150 });

  // Badge top-right
  const bX = PAGE_W - MARGIN - 140;
  rRect(doc, bX, 26, 140, 42, 6, null, "#93C5FD");
  doc
    .fillColor(C.white)
    .font("Helvetica-Bold")
    .fontSize(11)
    .text("PRODUCT CATALOG", bX, 36, { width: 140, align: "center" });
  doc
    .fillColor("#BFDBFE")
    .font("Helvetica")
    .fontSize(7.5)
    .text("Pharmaceutical Products", bX, 52, { width: 140, align: "center" });

  // Sub-bar text
  doc
    .fillColor(C.white)
    .font("Helvetica")
    .fontSize(8)
    .text(
      company.businessType + "   \u2022   " + company.address,
      MARGIN,
      157,
      { width: CONTENT_W, align: "center" }
    );

  // Catalog title block
  let y = 200;
  doc
    .fillColor(C.dark)
    .font("Helvetica-Bold")
    .fontSize(26)
    .text(title, MARGIN, y, { width: CONTENT_W, align: "center" });
  y += 38;

  if (subtitle) {
    doc
      .fillColor(C.muted)
      .font("Helvetica")
      .fontSize(11)
      .text(subtitle, MARGIN, y, { width: CONTENT_W, align: "center" });
    y += 24;
  }

  // Divider
  doc
    .moveTo(MARGIN + 60, y + 8)
    .lineTo(PAGE_W - MARGIN - 60, y + 8)
    .strokeColor(C.border)
    .lineWidth(1)
    .stroke();
  y += 26;

  // Stats strip
  const stats = [
    { label: "Total Products", value: String(totalProducts) },
    { label: "Certification", value: "ISO 9001:2015" },
    { label: "Manufacturing", value: "WHO-GMP" },
    { label: "Business", value: "Since 2020" },
  ];
  const statW = CONTENT_W / stats.length;
  stats.forEach((s, i) => {
    const sx = MARGIN + i * statW;
    rRect(doc, sx + 4, y, statW - 8, 56, 8, C.accent, C.border);
    doc
      .fillColor(C.primary)
      .font("Helvetica-Bold")
      .fontSize(15)
      .text(s.value, sx + 4, y + 10, { width: statW - 8, align: "center" });
    doc
      .fillColor(C.muted)
      .font("Helvetica")
      .fontSize(8)
      .text(s.label, sx + 4, y + 32, { width: statW - 8, align: "center" });
  });
  y += 72;

  // Contact info box
  rRect(doc, MARGIN, y, CONTENT_W, 60, 10, C.light, C.border);
  doc
    .fillColor(C.primary)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("Contact Us", MARGIN, y + 10, { width: CONTENT_W, align: "center" });
  doc
    .fillColor(C.dark)
    .font("Helvetica")
    .fontSize(9)
    .text(`${company.phone}   |   ${company.email}`, MARGIN, y + 26, {
      width: CONTENT_W,
      align: "center",
    });
  doc
    .fillColor(C.muted)
    .font("Helvetica")
    .fontSize(8.5)
    .text(company.businessHours, MARGIN, y + 42, {
      width: CONTENT_W,
      align: "center",
    });

  drawFooter(doc, company);
}

// ── Draw one product row (full width, compact) ────────────────────────────────
function drawProductRow(doc, product, imgBuf, y, index) {
  const ROW_H = 110;
  const IMG_W = 90;
  const IMG_H = 90;
  const PAD = 10;
  const bg = index % 2 === 0 ? C.white : C.light;

  // Row background
  rRect(doc, MARGIN, y, CONTENT_W, ROW_H, 8, bg, C.border);

  // Serial number
  doc
    .fillColor(C.primary)
    .font("Helvetica-Bold")
    .fontSize(11)
    .text(String(index + 1).padStart(2, "0"), MARGIN + PAD, y + ROW_H / 2 - 8, {
      width: 22,
      align: "center",
      lineBreak: false,
    });

  // Image box
  const imgX = MARGIN + PAD + 28;
  rRect(doc, imgX, y + PAD, IMG_W, IMG_H, 6, C.accent, null);
  if (imgBuf) {
    try {
      doc.image(imgBuf, imgX, y + PAD, {
        fit: [IMG_W, IMG_H],
        align: "center",
        valign: "center",
      });
    } catch {
      /* skip */
    }
  }

  // Text area
  const textX = imgX + IMG_W + 12;
  const textW = CONTENT_W - (textX - MARGIN) - PAD;
  let ty = y + PAD;

  // Category chip
  if (product.categoryName) {
    rRect(doc, textX, ty, 80, 14, 7, C.accent, null);
    doc
      .fillColor(C.primary)
      .font("Helvetica-Bold")
      .fontSize(6.5)
      .text(product.categoryName.toUpperCase(), textX + 4, ty + 4, {
        width: 72,
        lineBreak: false,
      });
    ty += 18;
  }

  // Product name
  doc
    .fillColor(C.dark)
    .font("Helvetica-Bold")
    .fontSize(11)
    .text(product.name, textX, ty, { width: textW, lineBreak: false });
  ty += 16;

  // Specs inline
  const specItems = [
    product.brand ? `Brand: ${product.brand}` : null,
    product.form ? `Form: ${product.form}` : null,
    product.packagingSize ? `Pack: ${product.packagingSize}` : null,
  ]
    .filter(Boolean)
    .join("   |   ");

  if (specItems) {
    doc
      .fillColor(C.muted)
      .font("Helvetica")
      .fontSize(8)
      .text(specItems, textX, ty, { width: textW, lineBreak: false });
    ty += 13;
  }

  // Description — max 2 lines
  if (product.description) {
    doc
      .fillColor("#475569")
      .font("Helvetica")
      .fontSize(8.5)
      .text(product.description, textX, ty, {
        width: textW,
        height: 30,
        lineBreak: true,
        ellipsis: true,
      });
  }

  // "Get Latest Price" tag — bottom right
  const priceX = MARGIN + CONTENT_W - 110 - PAD;
  const priceY = y + ROW_H - 22;
  rRect(doc, priceX, priceY, 110, 16, 8, C.primary, null);
  doc
    .fillColor(C.white)
    .font("Helvetica-Bold")
    .fontSize(7.5)
    .text("Get Latest Price", priceX, priceY + 4, {
      width: 110,
      align: "center",
      lineBreak: false,
    });

  return ROW_H + 6; // return height used (including gap)
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN CONTROLLER
// GET /api/products/catalog/pdf
// GET /api/products/catalog/pdf?category=<categoryId>
// ─────────────────────────────────────────────────────────────────────────────
async function generateCatalogPDF(req, res, next) {
  try {
    const { category: categoryId } = req.query;

    // ── 1. Fetch products ───────────────────────────────────────────────────
    const filter = {};
    if (categoryId) filter.category = categoryId;

    const products = await Product.find(filter)
      .populate("category", "name")
      .sort({ isFeatured: -1, createdAt: -1 });

    if (products.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No products found." });
    }

    // ── 2. Fetch company info ───────────────────────────────────────────────
    const [contactContent, aboutContent] = await Promise.all([
      SiteContent.getContent("contact"),
      SiteContent.getContent("about"),
    ]);

    const company = {
      name: "Biolex Pharmaceutical Pvt. Ltd.",
      address:
        contactContent.address ||
        "SCF-320, 2nd Floor, Motor Market, Manimajra, Chandigarh - 160101",
      phone: contactContent.phone || "8816036666, 8629936666",
      email: contactContent.email || "biolexpharmaceuticals@gmail.com",
      gstin: contactContent.gstin || "04AAJCB2451N1ZM",
      cin: contactContent.cin || "U51909CH2020PTC043192",
      businessHours:
        contactContent.businessHours || "Mon-Sat: 9:00 AM - 6:00 PM",
      certification:
        aboutContent.certification || "ISO 9001:2015 | WHO-GMP Supported",
      businessType:
        aboutContent.businessType ||
        "Wholesaler / Distributor / PCD Pharma Franchise",
    };

    // ── 3. Determine catalog title ──────────────────────────────────────────
    let catalogTitle = "Full Product Catalog";
    let catalogSubtitle = `${products.length} Products`;
    let fileSlug = "Biolex_Full_Catalog";

    if (categoryId) {
      const cat = await Category.findById(categoryId);
      const catName = cat ? cat.name : "Category";
      catalogTitle = `${catName} Catalog`;
      catalogSubtitle = `${products.length} Products in ${catName}`;
      fileSlug = `Biolex_${catName.replace(/\s+/g, "_")}_Catalog`;
    }

    // ── 4. Fetch all product images in parallel ─────────────────────────────
    const imageBuffers = await Promise.all(
      products.map((p) =>
        p.image ? fetchImageBuffer(p.image) : Promise.resolve(null)
      )
    );

    // ── 5. Build PDF ────────────────────────────────────────────────────────
    const doc = new PDFDocument({
      size: "A4",
      margin: 0,
      bufferPages: true,
      info: {
        Title: catalogTitle + " - Biolex Pharmaceutical",
        Author: company.name,
        Subject: "Pharmaceutical Product Catalog",
      },
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileSlug}.pdf"`
    );
    doc.pipe(res);

    // ── Cover page ──────────────────────────────────────────────────────────
    drawCoverPage(doc, company, catalogTitle, catalogSubtitle, products.length);

    // ── Products pages ──────────────────────────────────────────────────────
    // Group products by category for section headers
    const grouped = {};
    const groupOrder = [];
    products.forEach((p) => {
      const catKey = p.categoryName || "Other";
      if (!grouped[catKey]) {
        grouped[catKey] = [];
        groupOrder.push(catKey);
      }
      grouped[catKey].push(p);
    });

    let globalIndex = 0;

    for (const catName of groupOrder) {
      const catProducts = grouped[catName];

      // ── New page for each category section ───────────────────────────────
      doc.addPage({ size: "A4", margin: 0 });
      drawPageTop(doc);
      let y = 20;

      // Category section header
      rRect(doc, MARGIN, y, CONTENT_W, 30, 6, C.primary, null);
      doc
        .fillColor(C.white)
        .font("Helvetica-Bold")
        .fontSize(12)
        .text(catName.toUpperCase(), MARGIN + 12, y + 9, {
          width: CONTENT_W - 24,
        });
      doc
        .fillColor("#BFDBFE")
        .font("Helvetica")
        .fontSize(8)
        .text(
          `${catProducts.length} product${catProducts.length !== 1 ? "s" : ""}`,
          MARGIN + 12,
          y + 9,
          { width: CONTENT_W - 24, align: "right" }
        );
      y += 38;

      // Draw each product row
      for (let i = 0; i < catProducts.length; i++) {
        const product = catProducts[i];
        const imgBuf = imageBuffers[globalIndex];
        const rowH = 116; // ROW_H + gap

        // Page break check
        if (y + rowH > USABLE_BOT) {
          drawFooter(doc, company);
          doc.addPage({ size: "A4", margin: 0 });
          drawPageTop(doc);
          y = 20;
        }

        drawProductRow(doc, product, imgBuf, y, globalIndex);
        y += rowH;
        globalIndex++;
      }

      drawFooter(doc, company);
    }

    doc.end();
  } catch (err) {
    next(err);
  }
}

module.exports = { generateCatalogPDF };
