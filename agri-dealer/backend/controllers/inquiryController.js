const Inquiry = require('../models/Inquiry');
const Product = require('../models/Product');

// Create inquiry (public)
exports.createInquiry = async (req, res) => {
  try {
    const { customerName, phone, village, productInterested, productId, message, sessionId } = req.body;
    if (!customerName || !phone)
      return res.status(400).json({ success: false, message: 'Name and phone are required' });

    const inquiry = await Inquiry.create({
      customerName, phone, village, productInterested, productId: productId || null,
      message, sessionId: sessionId || null
    });

    // Increment product inquiry count
    if (productId) {
      await Product.findByIdAndUpdate(productId, { $inc: { inquiryCount: 1 } });
    }

    res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully! We will contact you shortly.',
      inquiry: { id: inquiry._id }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to submit inquiry' });
  }
};

// Get all inquiries (admin)
exports.getInquiries = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status && status !== 'All') query.status = status;
    if (search) query.$or = [
      { customerName: new RegExp(search, 'i') },
      { phone: new RegExp(search, 'i') },
      { productInterested: new RegExp(search, 'i') },
      { village: new RegExp(search, 'i') }
    ];

    const total = await Inquiry.countDocuments(query);
    const inquiries = await Inquiry.find(query)
      .populate('productId', 'name mainImage')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.json({ success: true, inquiries, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update inquiry status (admin)
exports.updateInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status, notes: req.body.notes },
      { new: true }
    );
    if (!inquiry) return res.status(404).json({ success: false, message: 'Inquiry not found' });
    res.json({ success: true, inquiry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete inquiry (admin)
exports.deleteInquiry = async (req, res) => {
  try {
    await Inquiry.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Inquiry deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
