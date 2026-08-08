const Visitor = require('../models/Visitor');

// Register/update visitor session (public)
exports.trackSession = async (req, res) => {
  try {
    const { sessionId, page, name, phone, language } = req.body;
    if (!sessionId) return res.status(400).json({ success: false, message: 'Session ID required' });

    let visitor = await Visitor.findOne({ sessionId });
    if (visitor) {
      visitor.lastVisit = new Date();
      visitor.visitCount += 1;
      if (page) visitor.pageViews.push({ page });
      if (name && !visitor.isIdentified) { visitor.name = name; visitor.isIdentified = true; }
      if (phone && !visitor.phone) visitor.phone = phone;
      if (language) visitor.language = language;
      await visitor.save();
      return res.json({ success: true, isReturning: true, isIdentified: visitor.isIdentified });
    } else {
      const newVisitor = await Visitor.create({
        sessionId,
        name: name || null,
        phone: phone || null,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        isIdentified: !!(name && phone),
        pageViews: page ? [{ page }] : [],
        language: language || 'en'
      });
      return res.json({ success: true, isReturning: false, isIdentified: newVisitor.isIdentified });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Identify visitor (public) - when user fills in name/phone
exports.identifyVisitor = async (req, res) => {
  try {
    const { sessionId, name, phone } = req.body;
    if (!sessionId || !name || !phone)
      return res.status(400).json({ success: false, message: 'Session ID, name, and phone required' });

    const visitor = await Visitor.findOneAndUpdate(
      { sessionId },
      { name, phone, isIdentified: true },
      { new: true, upsert: true }
    );
    res.json({ success: true, visitor: { name: visitor.name, phone: visitor.phone } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Check if visitor is already identified (public)
exports.checkVisitor = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const visitor = await Visitor.findOne({ sessionId });
    if (!visitor) return res.json({ success: true, isIdentified: false });
    res.json({ success: true, isIdentified: visitor.isIdentified, name: visitor.name });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Analytics (admin)
exports.getAnalytics = async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalVisitors,
      uniqueIdentified,
      todayVisitors,
      monthVisitors,
      recentVisitors
    ] = await Promise.all([
      Visitor.countDocuments(),
      Visitor.countDocuments({ isIdentified: true }),
      Visitor.countDocuments({ lastVisit: { $gte: todayStart } }),
      Visitor.countDocuments({ lastVisit: { $gte: monthStart } }),
      Visitor.find({ isIdentified: true })
        .sort({ lastVisit: -1 })
        .limit(20)
        .select('name phone visitCount firstVisit lastVisit pageViews')
    ]);

    // Daily visits for last 7 days
    const dailyStats = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayEnd = new Date(dayStart.getTime() + 86400000);
      const count = await Visitor.countDocuments({ lastVisit: { $gte: dayStart, $lt: dayEnd } });
      dailyStats.push({
        date: dayStart.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        visits: count
      });
    }

    const returningVisitors = await Visitor.countDocuments({ visitCount: { $gt: 1 } });

    res.json({
      success: true,
      analytics: {
        totalVisitors,
        uniqueIdentified,
        returningVisitors,
        todayVisitors,
        monthVisitors,
        dailyStats,
        recentVisitors
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all visitors list (admin)
exports.getVisitors = async (req, res) => {
  try {
    const { page = 1, limit = 30 } = req.query;
    const total = await Visitor.countDocuments({ isIdentified: true });
    const visitors = await Visitor.find({ isIdentified: true })
      .sort({ lastVisit: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
    res.json({ success: true, visitors, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
