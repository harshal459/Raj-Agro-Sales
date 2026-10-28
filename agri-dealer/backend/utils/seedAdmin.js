require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

const seedAdmin = async () => {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is required');
  }
  if (!username || !password) {
    throw new Error('ADMIN_USERNAME and ADMIN_PASSWORD are required');
  }

  await mongoose.connect(process.env.MONGO_URI);

  const existingAdmin = await Admin.findOne({ username });
  if (existingAdmin) {
    console.log(`Admin account "${username}" already exists.`);
    return;
  }

  await Admin.create({ username, password });
  console.log(`Admin account "${username}" created.`);
};

seedAdmin()
  .catch((error) => {
    console.error('Admin seeding failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
