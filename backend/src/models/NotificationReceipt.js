import mongoose from 'mongoose';

const notificationReceiptSchema = new mongoose.Schema(
  {
    notification: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Notification',
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

notificationReceiptSchema.index({ notification: 1, user: 1 }, { unique: true });

export const NotificationReceipt =
  mongoose.models.NotificationReceipt ||
  mongoose.model('NotificationReceipt', notificationReceiptSchema);
