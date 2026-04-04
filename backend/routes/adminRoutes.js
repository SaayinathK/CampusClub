const express = require('express');
const router = express.Router();
const { getAnalytics, getAllReceipts, updateReceiptStatus } = require('../controllers/adminController');
const { auth, admin } = require('../middleware/auth');

// Protect all admin routes with auth and admin middlewares
router.use(auth, admin);

// @route   GET /api/admin/analytics
// @desc    Get dashboard analytics
router.get('/analytics', getAnalytics);

// @route   GET /api/admin/receipts
// @desc    Get all uploaded slips from all students
router.get('/receipts', getAllReceipts);

// @route   PATCH /api/admin/receipts/:id
// @desc    Approve or reject a slip status
router.patch('/receipts/:id', updateReceiptStatus);

module.exports = router;
