const express = require('express');
const router = express.Router();
const { submitFeedback, getFeedbacksByEvent } = require('../controllers/feedbackController');
const { protect: auth } = require('../middleware/auth');

// Submit feedback (protected)
router.post('/', auth, submitFeedback);

// Get feedbacks for an event (public)
router.get('/:eventId', getFeedbacksByEvent);

module.exports = router;
