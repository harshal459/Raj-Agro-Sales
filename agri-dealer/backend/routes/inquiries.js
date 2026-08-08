const express = require('express');
const router = express.Router();
const inquiryController = require('../controllers/inquiryController');
const authMiddleware = require('../middleware/auth');

router.post('/', inquiryController.createInquiry);
router.get('/', authMiddleware, inquiryController.getInquiries);
router.put('/:id', authMiddleware, inquiryController.updateInquiry);
router.delete('/:id', authMiddleware, inquiryController.deleteInquiry);

module.exports = router;
