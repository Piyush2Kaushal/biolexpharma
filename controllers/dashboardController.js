const Product = require("../models/Product");
const Category = require("../models/Category");
const Inquiry = require("../models/Inquiry");

// GET /api/dashboard/stats
const getStats = async (req, res, next) => {
  try {
    const [
      totalProducts,
      totalCategories,
      totalInquiries,
      totalViewsAgg,
      inquiryStatuses,
      productsByCategory,
    ] = await Promise.all([
      Product.countDocuments(),
      Category.countDocuments(),
      Inquiry.countDocuments(),
      Product.aggregate([{ $group: { _id: null, total: { $sum: "$views" } } }]),
      Inquiry.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Product.aggregate([
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "categoryInfo",
          },
        },
        {
          $unwind: { path: "$categoryInfo", preserveNullAndEmptyArrays: true },
        },
        { $group: { _id: "$categoryInfo.name", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    const totalViews = totalViewsAgg[0]?.total || 0;

    const statusMap = { pending: 0, contacted: 0, resolved: 0 };
    inquiryStatuses.forEach((s) => {
      if (s._id in statusMap) statusMap[s._id] = s.count;
    });

    res.json({
      success: true,
      data: {
        totalProducts,
        totalCategories,
        totalInquiries,
        totalViews,
        pendingInquiries: statusMap.pending,
        contactedInquiries: statusMap.contacted,
        resolvedInquiries: statusMap.resolved,
        productsByCategory: productsByCategory.map((p) => ({
          name: p._id || "Uncategorized",
          count: p.count,
        })),
        inquiriesByStatus: [
          { status: "Pending", count: statusMap.pending, fill: "#f59e0b" },
          { status: "Contacted", count: statusMap.contacted, fill: "#3b82f6" },
          { status: "Resolved", count: statusMap.resolved, fill: "#10b981" },
        ],
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/dashboard/most-viewed?limit=10
const getMostViewed = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const products = await Product.find()
      .populate("category", "name")
      .sort({ views: -1 })
      .limit(limit)
      .select("name image views category isFeatured");

    res.json({
      success: true,
      data: products.map((p) => ({
        _id: p._id,
        name: p.name,
        image: p.image,
        views: p.views || 0,
        category: p.category?.name || "Uncategorized",
        isFeatured: p.isFeatured,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/dashboard/most-requested?limit=10
const getMostRequested = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const results = await Inquiry.aggregate([
      { $match: { productId: { $ne: null } } },
      { $group: { _id: "$productId", inquiryCount: { $sum: 1 } } },
      { $sort: { inquiryCount: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $lookup: {
          from: "categories",
          localField: "product.category",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      { $unwind: { path: "$categoryInfo", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: "$product._id",
          name: "$product.name",
          image: "$product.image",
          views: "$product.views",
          isFeatured: "$product.isFeatured",
          category: { $ifNull: ["$categoryInfo.name", "Uncategorized"] },
          inquiryCount: 1,
        },
      },
    ]);

    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats, getMostViewed, getMostRequested };
