const Feedback = require('../models/Feedback');

// @desc Submit feedback for an event
// @route POST /api/feedback
// @access Public (or private if you want to enforce login, but let's keep it simple first)
const submitFeedback = async (req, res) => {
    try {
        const { eventId, rating, comment, username } = req.body;

        if (!eventId || !rating || !comment) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const newFeedback = new Feedback({
            eventId,
            rating,
            comment,
            username: username || 'Anonymous'
        });

        const savedFeedback = await newFeedback.save();
        res.status(201).json({ message: 'Feedback submitted successfully.', feedback: savedFeedback });
    } catch (err) {
        console.error('Error in submitFeedback:', err);
        res.status(500).json({ message: 'Failed to submit feedback.' });
    }
};

// @desc Get all feedbacks for a specific event
// @route GET /api/feedback/:eventId
// @access Public
const getFeedbacksByEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const feedbacks = await Feedback.find({ eventId }).sort({ createdAt: -1 });
        res.status(200).json(feedbacks);
    } catch (err) {
        console.error('Error in getFeedbacksByEvent:', err);
        res.status(500).json({ message: 'Failed to fetch feedbacks.' });
    }
};

module.exports = {
    submitFeedback,
    getFeedbacksByEvent
};
