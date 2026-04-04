const Receipt = require('../models/Receipt');
const Feedback = require('../models/Feedback');
const User = require('../models/User');

// @desc Get analytics for popular events
// @route GET /api/admin/analytics
// @access Private (Admin)
exports.getAnalytics = async (req, res) => {
    try {
        // Find most popular events by feedback counts
        const popularEventsAnalytics = await Feedback.aggregate([
            {
                $group: {
                    _id: "$eventId",
                    count: { $sum: 1 },
                    avgRating: { $avg: "$rating" }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Feedback recent history
        const recentFeedbacks = await Feedback.find().sort({ createdAt: -1 }).limit(5);

        // Basic user stats
        const userStats = await User.aggregate([
            {
                $group: {
                    _id: "$role",
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            popularEvents: popularEventsAnalytics,
            recentFeedbacks,
            userStats
        });
    } catch (err) {
        console.error('Analytics Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc Get all receipts (from all students)
// @route GET /api/admin/receipts
// @access Private (Admin)
exports.getAllReceipts = async (req, res) => {
    try {
        const receipts = await Receipt.find()
            .populate('userId', 'username email role')
            .sort({ createdAt: -1 });
        res.status(200).json(receipts);
    } catch (err) {
        console.error('Error fetching all receipts:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc Update receipt status (Approve/Reject)
// @route PATCH /api/admin/receipts/:id
// @access Private (Admin)
exports.updateReceiptStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['Verified', 'Rejected', 'Pending'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const receipt = await Receipt.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate('userId', 'username email');

        if (!receipt) {
            return res.status(404).json({ message: 'Receipt not found' });
        }

        res.status(200).json({
            message: `Receipt successfully updated to ${status}`,
            receipt
        });
    } catch (err) {
        console.error('Update receipt error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
