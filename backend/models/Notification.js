const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: [
      'account_approved',
      'account_rejected',
      'event_published',
      'event_reminder',
      'event_rejected',
      'event_cancelled',
      'registration_confirmed',
      'registration_closing',
      'receipt_verified',
      'receipt_rejected',
    ],
    required: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  // Reminders are only visible after scheduledFor datetime (set to event startDate for reminders)
  scheduledFor: { type: Date, default: Date.now },
}, { timestamps: true });

NotificationSchema.index({ recipient: 1, scheduledFor: 1, read: 1 });

module.exports = mongoose.model('Notification', NotificationSchema);
