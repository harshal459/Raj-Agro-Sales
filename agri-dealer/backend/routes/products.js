const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/auth');

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../frontend/public/uploads')),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `product-${unique}${path.extname(file.originalname)}`);
  }
});
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  if (allowed.test(path.extname(file.originalname).toLowerCase())) cb(null, true);
  else cb(new Error('Only image files allowed'), false);
};
const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// Public routes
router.get('/', productController.getProducts);
router.get('/featured', productController.getFeaturedProducts);

// Admin routes
router.get('/admin/all', authMiddleware, productController.adminGetProducts);
router.post('/', authMiddleware, upload.array('images', 10), productController.createProduct);
router.put('/:id', authMiddleware, upload.array('images', 10), productController.updateProduct);
router.delete('/:id', authMiddleware, productController.deleteProduct);

// Public product detail route
router.get('/:slug', productController.getProduct);

module.exports = router;
