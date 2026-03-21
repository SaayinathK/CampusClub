const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getReceipts, uploadReceipt, deleteReceipt } = require('../controllers/receiptController');
const { protect: auth } = require('../middleware/auth');

// Multer Storage setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|pdf/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only Images and PDF files are allowed!'));
        }
    }
});

// Protect all routes
router.use(auth);

router.get('/', getReceipts);
router.post('/upload', upload.single('receipt'), uploadReceipt);
router.delete('/:id', deleteReceipt);

module.exports = router;
