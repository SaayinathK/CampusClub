const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    eventId: {
        type: Number,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
        required: true,
        trim: true,
    },
    username: {
        type: String,
        default: 'Anonymous',
    },
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
