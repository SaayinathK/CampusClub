import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['Event Update', 'Reminder', 'Alert', 'System'],
      default: 'System'
    },
    audienceType: {
      type: String,
      enum: ['All Students', 'Specific Community', 'Event Registrants'],
      required: true
    },
    audienceLabel: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['Sent', 'Failed'],
      default: 'Sent'
    },
    emailStatus: {
      type: String,
      enum: ['Sent', 'Skipped', 'Failed'],
      default: 'Sent'
    },
    recipientsCount: {
      type: Number,
      default: 0,
      min: 0
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      default: null
    },
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

export const Notification =
  mongoose.models.Notification ||
  mongoose.model('Notification', notificationSchema);
