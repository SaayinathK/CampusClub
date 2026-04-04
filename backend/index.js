const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

// Bypass DNS blocking on local router by using Google DNS
require('dns').setServers(['8.8.8.8', '8.8.4.4']);

// Hardcode MongoDB URI as fallback in case env injection fails
if (!process.env.MONGODB_URI && !process.env.MONGO_URI) {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/uniconnect';
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const path = require('path');
const fs = require('fs');

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

// Serve uploads folder static
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Basic Route
app.get('/', (req, res) => {
    res.send('Backend API is running...');
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/uniconnect', { family: 4 })
    .then(() => console.log('MongoDB successfully connected'))
    .catch((err) => console.error('MongoDB connection error: ', err));

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`); // Nodemon triggered again
});
