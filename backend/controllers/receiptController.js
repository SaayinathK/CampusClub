const Receipt = require('../models/Receipt');
const Event = require('../models/Event');
const path = require('path');
const fs = require('fs');

// Fetch user's receipts (optionally filtered by eventId)
exports.getReceipts = async (req, res) => {
    try {
        const query = { userId: req.user.id };
        if (req.query.eventId) query.eventId = req.query.eventId;

        const receipts = await Receipt.find(query).sort({ createdAt: -1 });
        res.status(200).json(receipts);
    } catch (error) {
        console.error('Error fetching receipts:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Upload new receipt and link to event participant
exports.uploadReceipt = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { eventId } = req.body;

        const newReceipt = new Receipt({
            userId: req.user.id,
            eventId: eventId || undefined,
            fileName: req.file.filename,
            originalName: req.file.originalname,
            fileUrl: `/uploads/${req.file.filename}`,
            status: 'Pending',
        });

        await newReceipt.save();

        // If linked to an event, update the participant's paymentStatus → pending and store receiptId
        if (eventId) {
            const event = await Event.findById(eventId);
            if (event) {
                const participant = event.participants.find(
                    (p) => p.user && p.user.toString() === req.user.id
                );
                if (participant) {
                    participant.paymentStatus = 'pending';
                    participant.receiptId = newReceipt._id;
                    await event.save();
                }
            }
        }

        res.status(201).json(newReceipt);
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ message: 'Server error during upload' });
    }
};

// Delete receipt
exports.deleteReceipt = async (req, res) => {
    try {
        const receipt = await Receipt.findById(req.params.id);

        if (!receipt) {
            return res.status(404).json({ message: 'Receipt not found' });
        }

        if (receipt.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // If the receipt was linked to an event, reset the participant paymentStatus
        if (receipt.eventId) {
            const event = await Event.findById(receipt.eventId);
            if (event) {
                const participant = event.participants.find(
                    (p) => p.user && p.user.toString() === req.user.id
                );
                if (participant && participant.receiptId?.toString() === receipt._id.toString()) {
                    participant.paymentStatus = 'pending';
                    participant.receiptId = undefined;
                    await event.save();
                }
            }
        }

        const filePath = path.join(__dirname, '..', 'uploads', receipt.fileName);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await Receipt.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Receipt deleted successfully' });
    } catch (error) {
        console.error('Delete Error:', error);
        res.status(500).json({ message: 'Server error during deletion' });
    }
};
