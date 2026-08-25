require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const connectDB = require('./config/database');
const trackVisitor = require('./middleware/visitorTracker');

const app = express();

// Connect DB
connectDB();

// Correct paths
const frontendDir = path.join(__dirname, '../frontend/public');
const uploadsDir = path.join(frontendDir, 'uploads');
const adminDir = path.join(__dirname, '../admin');

// Create uploads directory if not exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Security
app.use(helmet({ contentSecurityPolicy: false }));

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many requests'
});

app.use('/api/', limiter);

// Stricter rate limit for auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts'
});

app.use('/api/auth/login', authLimiter);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Visitor tracking middleware
app.use('/api/', trackVisitor);

// Serve frontend static files
app.use(express.static(frontendDir));

// Serve uploads
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/inquiries', require('./routes/inquiries'));
app.use('/api/visitors', require('./routes/visitors'));

// Admin dashboard
app.use('/admin', express.static(adminDir));

app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(adminDir, 'index.html'));
});

// All other routes serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`🔧 Admin: http://localhost:${PORT}/admin`);
});
