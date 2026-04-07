const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [200, "Name cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    image: {
      type: String,
      required: [true, "Product image is required"],
    },
    imagePublicId: {
      type: String,
    },
    packagingSize: { type: String, trim: true },
    brand: { type: String, trim: true },
    form: { type: String, trim: true },
    countryOfOrigin: { type: String, trim: true, default: "India" },
    composition: { type: String, trim: true },
    dosage: { type: String, trim: true },
    storage: { type: String, trim: true },
    sideEffects: { type: String, trim: true },
    additionalDetails: [
      {
        key: { type: String, trim: true },
        value: { type: String, trim: true },
      },
    ],
    isFeatured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.virtual("categoryName").get(function () {
  if (this.category && this.category.name) return this.category.name;
  return undefined;
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Product", productSchema);
