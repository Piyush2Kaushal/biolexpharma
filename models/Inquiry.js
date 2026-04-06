const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      maxlength: [20, 'Phone cannot exceed 20 characters'],
    },
    company: {
      type: String,
      trim: true,
      maxlength: [200, 'Company name cannot exceed 200 characters'],
    },
    quantity: {
      type: String,
      trim: true,
      maxlength: [100, 'Quantity cannot exceed 100 characters'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'contacted', 'resolved'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// Virtual: productName
inquirySchema.virtual('productName').get(function () {
  if (this.productId && this.productId.name) {
    return this.productId.name;
  }
  return undefined;
});

inquirySchema.set('toJSON', { virtuals: true });
inquirySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Inquiry', inquirySchema);
