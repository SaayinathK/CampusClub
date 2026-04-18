const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config({ override: true });

// Bypass DNS blocking on local router by using Google DNS
require('dns').setServers(['8.8.8.8', '8.8.4.4']);

// Hardcode MongoDB URI as fallback in case env injection fails
if (!process.env.MONGODB_URI && !process.env.MONGO_URI) {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/uniconnect';
}

const app = express();
const PORT = process.env.PORT || 5001;

// Simple explicit CORS + preflight handler (DEV only) — must run before routes
const allowedOrigins = ['http://localhost:3000', 'http://localhost:5173'];
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  // respond to preflight immediately so no later middleware (auth etc.) blocks it
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// 3. JSON parser
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.url);
  next();
});

const path = require('path');
const fs = require('fs');

// Health check endpoints
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.post('/test', (req, res) => res.json({ ok: true, body: req.body }));

// Create uploads folder if not exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/receipts', require('./routes/receiptRoutes'));
app.use('/api/users', require('./routes/users'));
app.use('/api/communities', require('./routes/communities'));
app.use('/api/events', require('./routes/events'));
app.use('/api/memberships', require('./routes/memberships'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/notifications', require('./routes/notifications'));

// Serve uploads folder static
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Basic Route
app.get('/', (req, res) => {
  res.send('Backend API is running...');
});

// MongoDB Connection
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/uniconnect';
mongoose.connect(mongoUri, { family: 4 })
  .then(() => {
    console.log('MongoDB successfully connected');
    // bind to 0.0.0.0 so localhost resolves reliably to your Node server
    const host = '0.0.0.0';
    app.listen(PORT, host, () => {
      console.log(`Server listening on http://${host}:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error: ', err);
    // start server anyway so frontend/CORS/health endpoints can be tested during dev
    const host = '0.0.0.0';
    app.listen(PORT, host, () => {
      console.log(`Server started (no DB) on http://${host}:${PORT}`);
    });
  });

// DEBUG: log incoming auth headers/cookies (temporary)
app.use((req, res, next) => {
  console.log('AUTH DEBUG:', req.method, req.url, 'Authorization=', req.headers.authorization, 'Cookie=', req.headers.cookie);
  next();
});