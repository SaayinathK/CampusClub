import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true
    },
    status: {
      type: String,
      enum: ['Registered', 'Attended', 'Cancelled'],
      default: 'Registered'
    },
    paymentStatus: {
      type: String,
      enum: ['Free', 'Paid', 'Pending'],
      default: 'Free'
    }
  },
  {
    timestamps: true
  }
);

registrationSchema.index({ student: 1, event: 1 }, { unique: true });

export const Registration =
  mongoose.models.Registration ||
  mongoose.model('Registration', registrationSchema);
