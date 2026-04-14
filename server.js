require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

const authRoutes = require("./routes/auth");
const categoryRoutes = require("./routes/categories");
const productRoutes = require("./routes/products");
const inquiryRoutes = require("./routes/inquiries");
const statsRoutes = require("./routes/stats");
const dashboardRoutes = require("./routes/dashboard");
const reviewRoutes = require("./routes/reviews");
const contentRoutes = require("./routes/content");
const testimonialRoutes = require("./routes/testimonials");
const homeCardRoutes = require("./routes/homecards");
const bulkUploadRoutes = require("./routes/bulkUpload");
const productPdfRoutes = require("./routes/productPdf");

connectDB();

const app = express();

// Gzip compress all responses — reduces JSON/HTML payload by ~70%
app.use(compression());
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:4173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) callback(null, true);
      else callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "Pharma API is running ✅",
    env: process.env.NODE_ENV,
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/homecards", homeCardRoutes);
app.use("/api/bulk-upload", bulkUploadRoutes);
app.use("/api/products", productPdfRoutes);

app.use((_req, res) =>
  res.status(404).json({ success: false, message: "Route not found." })
);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `🚀 Server running on port ${PORT} in ${
      process.env.NODE_ENV || "development"
    } mode`
  );
});

module.exports = app;
