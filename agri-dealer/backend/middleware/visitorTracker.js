const Visitor = require('../models/Visitor');

const trackVisitor = async (req, res, next) => {
  try {
    const sessionId = req.headers['x-session-id'];
    const page = req.headers['x-page'] || req.path;
    if (!sessionId) return next();

    const visitor = await Visitor.findOne({ sessionId });
    if (visitor) {
      visitor.visitCount += 1;
      visitor.lastVisit = new Date();
      visitor.pageViews.push({ page });
      if (visitor.pageViews.length > 100) visitor.pageViews.shift();
      await visitor.save();
    } else {
      await Visitor.create({
        sessionId,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        pageViews: [{ page }]
      });
    }
  } catch (err) {
    // Silent fail — tracking should never break the request
  }
  next();
};

module.exports = trackVisitor;
