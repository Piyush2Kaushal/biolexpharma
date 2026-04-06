const XLSX = require("xlsx");
const Product = require("../models/Product");
const Category = require("../models/Category");

/**
 * POST /api/bulk-upload/products
 * Accepts an Excel (.xlsx) or CSV (.csv) file and inserts products in bulk.
 */
const bulkUpload = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an Excel (.xlsx) or CSV (.csv) file.",
      });
    }

    // Parse workbook from buffer
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return res
        .status(400)
        .json({ success: false, message: "Excel file has no sheets." });
    }

    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    if (!rows || rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Excel file is empty or has no data rows.",
      });
    }

    // Load all categories (for name → ObjectId mapping)
    const allCategories = await Category.find({});
    const categoryMap = {};
    allCategories.forEach((cat) => {
      categoryMap[cat.name.trim().toLowerCase()] = cat._id;
    });

    const successList = [];
    const failedList = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // +2 because row 1 is header

      // Normalize column names (case-insensitive, trim spaces)
      const get = (keys) => {
        for (const key of keys) {
          const found = Object.keys(row).find(
            (k) => k.trim().toLowerCase() === key.toLowerCase()
          );
          if (found !== undefined) return String(row[found]).trim();
        }
        return "";
      };

      const name = get(["Product Name", "Name", "product_name", "ProductName"]);
      const categoryName = get(["Category", "category_name", "CategoryName"]);
      const description = get(["Description", "desc"]);
      const imageUrl = get([
        "Image URL",
        "ImageURL",
        "image_url",
        "Image",
        "image",
      ]);
      const packagingSize = get([
        "Packaging Size",
        "packaging_size",
        "PackagingSize",
        "Packaging",
      ]);
      const brand = get(["Brand", "brand_name", "BrandName"]);
      const form = get(["Form", "form_type", "FormType", "DosageForm"]);
      const countryOfOrigin =
        get([
          "Country of Origin",
          "country_of_origin",
          "CountryOfOrigin",
          "Country",
        ]) || "India";

      // Validate required fields
      const errors = [];
      if (!name) errors.push("Product Name is required");
      if (!description) errors.push("Description is required");
      if (!categoryName) errors.push("Category is required");

      if (errors.length > 0) {
        failedList.push({
          row: rowNum,
          name: name || `Row ${rowNum}`,
          reason: errors.join("; "),
        });
        continue;
      }

      // Resolve category
      const categoryId = categoryMap[categoryName.toLowerCase()];
      if (!categoryId) {
        failedList.push({
          row: rowNum,
          name,
          reason: `Category "${categoryName}" not found. Create it in admin panel first.`,
        });
        continue;
      }

      // Check duplicate product (by name, case-insensitive)
      const existing = await Product.findOne({
        name: {
          $regex: new RegExp(
            `^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
            "i"
          ),
        },
      });
      if (existing) {
        failedList.push({
          row: rowNum,
          name,
          reason: "Duplicate: product with this name already exists.",
        });
        continue;
      }

      // Image: use provided URL or a default placeholder
      const image =
        imageUrl ||
        `https://placehold.co/400x400/e2e8f0/475569?text=${encodeURIComponent(
          name.substring(0, 15)
        )}`;

      try {
        const product = await Product.create({
          name,
          description,
          category: categoryId,
          image,
          packagingSize: packagingSize || undefined,
          brand: brand || undefined,
          form: form || undefined,
          countryOfOrigin,
        });
        successList.push({ row: rowNum, name, id: product._id });
      } catch (err) {
        failedList.push({ row: rowNum, name, reason: err.message });
      }
    }

    res.json({
      success: true,
      message: `Bulk upload complete. ${successList.length} added, ${failedList.length} failed.`,
      data: {
        total: rows.length,
        inserted: successList.length,
        failed: failedList.length,
        successList,
        failedList,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/bulk-upload/categories
 * Accepts an Excel (.xlsx) or CSV (.csv) file and inserts categories in bulk.
 * Excel format: single column "Category Name"
 */
const bulkUploadCategories = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an Excel (.xlsx) or CSV (.csv) file.",
      });
    }

    // Parse workbook from buffer
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return res
        .status(400)
        .json({ success: false, message: "Excel file has no sheets." });
    }

    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    if (!rows || rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Excel file is empty or has no data rows.",
      });
    }

    // Load all existing categories for duplicate checking (case-insensitive)
    const existingCategories = await Category.find({});
    const existingNames = new Set(
      existingCategories.map((c) => c.name.trim().toLowerCase())
    );

    let added = 0;
    let skipped = 0;
    let duplicates = 0;
    const errors = [];
    const seenInFile = new Set(); // Track duplicates within the uploaded file itself

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;

      // Extract category name — support various column header spellings
      const rawName =
        row["Category Name"] ||
        row["category name"] ||
        row["CategoryName"] ||
        row["category_name"] ||
        row["Name"] ||
        row["name"] ||
        "";

      const name = String(rawName).trim();

      // Skip empty rows
      if (!name) {
        skipped++;
        continue;
      }

      const nameLower = name.toLowerCase();

      // Skip duplicates already in DB
      if (existingNames.has(nameLower)) {
        duplicates++;
        continue;
      }

      // Skip duplicates within the same file
      if (seenInFile.has(nameLower)) {
        duplicates++;
        continue;
      }

      seenInFile.add(nameLower);

      // Convert to proper case (capitalize first letter of each word)
      const properName = name
        .split(" ")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");

      try {
        await Category.create({ name: properName });
        existingNames.add(nameLower); // update in-memory set
        added++;
      } catch (err) {
        errors.push({ row: rowNum, name, reason: err.message });
        skipped++;
      }
    }

    res.json({
      success: true,
      message: `Bulk category upload complete. ${added} added, ${duplicates} duplicate(s) skipped.`,
      data: {
        added,
        skipped,
        duplicates,
        errors,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { bulkUpload, bulkUploadCategories };
