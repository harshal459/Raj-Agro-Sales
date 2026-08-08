const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  nameMarathi: { type: String, trim: true },
  nameHindi: { type: String, trim: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  descriptionMarathi: { type: String },
  descriptionHindi: { type: String },
  price: { type: Number, required: true },
  priceDisplay: { type: String }, // e.g. "₹2,50,000"
  category: {
    type: String,
    required: true,
    enum: ['Thresher', 'Rotavator', 'Tillers', 'Sprayers', 'Seeders', 'other']
  },
  brand: { type: String, required: true },
  images: [{ type: String }], // image paths
  mainImage: { type: String },
  features: [{ type: String }],
  specifications: [{
    key: String,
    value: String
  }],
  benefits: [{ type: String }],
  availability: {
    type: String,
    enum: ['In Stock', 'Out of Stock', 'On Order'],
    default: 'In Stock'
  },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  viewCount: { type: Number, default: 0 },
  inquiryCount: { type: Number, default: 0 }
}, { timestamps: true });

productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ viewCount: -1 });

module.exports = mongoose.model('Product', productSchema);
