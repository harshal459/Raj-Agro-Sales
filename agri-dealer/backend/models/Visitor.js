const mongoose = require('mongoose');

const pageViewSchema = new mongoose.Schema({
  page: String,
  visitedAt: { type: Date, default: Date.now }
});

const visitorSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  name: { type: String, default: null },
  phone: { type: String, default: null },
  ipAddress: String,
  userAgent: String,
  firstVisit: { type: Date, default: Date.now },
  lastVisit: { type: Date, default: Date.now },
  visitCount: { type: Number, default: 1 },
  pageViews: [pageViewSchema],
  isIdentified: { type: Boolean, default: false },
  language: { type: String, default: 'en' }
}, { timestamps: true });

visitorSchema.index({ sessionId: 1 });
visitorSchema.index({ phone: 1 });
visitorSchema.index({ firstVisit: 1 });

module.exports = mongoose.model('Visitor', visitorSchema);
