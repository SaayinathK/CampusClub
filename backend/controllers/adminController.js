const Receipt = require('../models/Receipt');
const Feedback = require('../models/Feedback');
const User = require('../models/User');
const Event = require('../models/Event');

// @desc Get analytics for popular events
// @route GET /api/admin/analytics
// @access Private (Admin)
exports.getAnalytics = async (_req, res) => {
    try {
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

        const recentFeedbacks = await Feedback.find().sort({ createdAt: -1 }).limit(5);

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
exports.getAllReceipts = async (_req, res) => {
    try {
        const receipts = await Receipt.find()
            .populate('userId', 'name email role')
            .populate('eventId', 'title')
            .sort({ createdAt: -1 });
        res.status(200).json(receipts);
    } catch (err) {
        console.error('Error fetching all receipts:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc Update receipt status (Approve/Reject) and sync participant paymentStatus
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
        ).populate('userId', 'name email');

        if (!receipt) {
            return res.status(404).json({ message: 'Receipt not found' });
        }

        // Sync the participant's paymentStatus on the linked event
        if (receipt.eventId) {
            const paymentStatusMap = { Verified: 'verified', Rejected: 'rejected', Pending: 'pending' };
            const newPaymentStatus = paymentStatusMap[status];

            const event = await Event.findById(receipt.eventId);
            if (event) {
                const participant = event.participants.find(
                    (p) => p.user && p.user.toString() === receipt.userId._id.toString()
                );
                if (participant) {
                    participant.paymentStatus = newPaymentStatus;
                    await event.save();
                }
            }
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
