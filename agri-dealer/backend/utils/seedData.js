require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Admin = require('../models/Admin');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/agri-dealer');
  console.log('DB connected');
};

const products = [
  { }
];

const seed = async () => {
  await connectDB();

  // Clear existing
  await Product.deleteMany({});
  await Admin.deleteMany({});

  // Insert products
  await Product.insertMany(products);
  console.log('✅ Products seeded');

  // Create admin
  const admin = await Admin.create({
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'Admin@1234'
  });
  console.log('✅ Admin created:', admin.username);

  await mongoose.disconnect();
  console.log('✅ Seeding complete');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
