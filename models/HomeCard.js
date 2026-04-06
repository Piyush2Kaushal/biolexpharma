const mongoose = require('mongoose');

const homeCardSchema = new mongoose.Schema(
  {
    section: {
      type: String,
      required: true,
      enum: ['features', 'why_us', 'highlights'],
    },
    icon: { type: String, default: 'Shield' }, // Lucide icon name
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    color: { type: String, default: 'blue' }, // color theme
    order: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('HomeCard', homeCardSchema);
