const Product = require('../models/Product');
const path = require('path');
const fs = require('fs');

// Helper: create slug
const createSlug = (name) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// GET all active products (public)
exports.getProducts = async (req, res) => {
  try {
    const { category, brand, search, page = 1, limit = 12 } = req.query;
    const query = { isActive: true };
    if (category && category !== 'All') query.category = category;
    if (brand) query.brand = new RegExp(brand, 'i');
    if (search) query.$or = [
      { name: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') },
      { brand: new RegExp(search, 'i') }
    ];

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .select('-specifications -benefits');

    res.json({ success: true, products, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET single product by slug (public)
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    product.viewCount += 1;
    await product.save();

    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET featured products (public)
exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true, isFeatured: true })
      .limit(6)
      .select('name slug mainImage price category brand availability');
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET all products (admin)
exports.adminGetProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// CREATE product (admin)
exports.createProduct = async (req, res) => {
  try {
    const data = req.body;
    let slug = createSlug(data.name);
    const exists = await Product.findOne({ slug });
    if (exists) slug = `${slug}-${Date.now()}`;

    // Handle uploaded images
    const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];
    const mainImage = images[0] || '/images/placeholder.jpg';

    // Parse arrays/objects from JSON strings if needed
    if (typeof data.features === 'string') data.features = JSON.parse(data.features || '[]');
    if (typeof data.specifications === 'string') data.specifications = JSON.parse(data.specifications || '[]');
    if (typeof data.benefits === 'string') data.benefits = JSON.parse(data.benefits || '[]');

    const product = await Product.create({
      ...data,
      slug,
      images,
      mainImage,
      price: Number(data.price)
    });

    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE product (admin)
exports.updateProduct = async (req, res) => {
  try {
    const data = req.body;
    if (typeof data.features === 'string') data.features = JSON.parse(data.features || '[]');
    if (typeof data.specifications === 'string') data.specifications = JSON.parse(data.specifications || '[]');
    if (typeof data.benefits === 'string') data.benefits = JSON.parse(data.benefits || '[]');

    const newImages = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];
    if (newImages.length > 0) {
      data.images = newImages;
      data.mainImage = newImages[0];
    }
    if (data.price) data.price = Number(data.price);

    const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE product (admin)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
