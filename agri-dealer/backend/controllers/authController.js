const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ success: false, message: 'Username and password required' });

    const admin = await Admin.findOne({ username });
    if (!admin)
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const isValid = await admin.comparePassword(password);
    if (!isValid)
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    admin.lastLogin = new Date();
    await admin.save();

    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({ success: true, token, admin: { username: admin.username } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.verifyToken = (req, res) => {
  res.json({ success: true, admin: req.admin });
};
