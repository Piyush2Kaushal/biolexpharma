const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Review text is required'],
      trim: true,
      maxlength: [1000, 'Review cannot exceed 1000 characters'],
    },
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    designation: {
      type: String,
      trim: true,
      maxlength: [150, 'Designation cannot exceed 150 characters'],
    },
    image: {
      type: String, // cloudinary URL
      default: '',
    },
    rating: {
      type: Number,
      default: 5,
      min: 1,
      max: 5,
    },
    order: {
      type: Number,
      default: 0,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Testimonial', testimonialSchema);
