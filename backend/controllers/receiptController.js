const Receipt = require('../models/Receipt');
const path = require('path');
const fs = require('fs');

// Fetch user's receipts
exports.getReceipts = async (req, res) => {
    try {
        const receipts = await Receipt.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(receipts);
    } catch (error) {
        console.error('Error fetching receipts:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Upload new receipt
exports.uploadReceipt = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const newReceipt = new Receipt({
            userId: req.user.id,
            fileName: req.file.filename,
            originalName: req.file.originalname,
            fileUrl: `/uploads/${req.file.filename}`,
            status: 'Pending'
        });

        await newReceipt.save();
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

        // Verify ownership
        if (receipt.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Delete file from disk
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
