const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  customerName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  village: { type: String, trim: true },
  productInterested: { type: String, trim: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
  message: { type: String, trim: true },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Converted', 'Closed'],
    default: 'New'
  },
  notes: { type: String },
  sessionId: { type: String },
  source: { type: String, default: 'website' } // website, whatsapp, phone
}, { timestamps: true });

inquirySchema.index({ status: 1 });
inquirySchema.index({ createdAt: -1 });
inquirySchema.index({ phone: 1 });

module.exports = mongoose.model('Inquiry', inquirySchema);
