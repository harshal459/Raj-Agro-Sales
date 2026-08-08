const express = require('express');
const router = express.Router();
const visitorController = require('../controllers/visitorController');
const authMiddleware = require('../middleware/auth');

// Public
router.post('/track', visitorController.trackSession);
router.post('/identify', visitorController.identifyVisitor);
router.get('/check/:sessionId', visitorController.checkVisitor);

// Admin
router.get('/analytics', authMiddleware, visitorController.getAnalytics);
router.get('/list', authMiddleware, visitorController.getVisitors);

module.exports = router;
