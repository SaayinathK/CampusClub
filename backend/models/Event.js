const mongoose = require('mongoose');
const { randomUUID } = require('crypto');

const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      enum: ['Technology', 'Arts', 'Sports', 'Academic', 'Cultural', 'Business', 'Science', 'Social', 'Other'],
      default: 'Other',
    },
    coverImage: {
      type: String,
      default: '',
    },
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Event lifecycle: pending_approval → published → completed
    status: {
      type: String,
      enum: ['draft', 'pending_approval', 'published', 'completed', 'cancelled', 'rejected'],
      default: 'pending_approval',
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
    },
    venue: {
      type: String,
      maxlength: [200, 'Venue cannot exceed 200 characters'],
    },
    isVirtual: {
      type: Boolean,
      default: false,
    },
    virtualLink: {
      type: String,
    },
    maxParticipants: {
      type: Number,
    },
    // Unique code for external participants to join
    eventCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    allowExternal: {
      type: Boolean,
      default: false,
    },
    // Paid event fields
    isFree: { type: Boolean, default: true },
    ticketPrice: { type: Number, default: 0 },
    // Registered participants
    participants: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        registeredAt: { type: Date, default: Date.now },
        type: { type: String, enum: ['student', 'external'], default: 'student' },
        attended: { type: Boolean, default: false },
        // Payment tracking (for paid events)
        paymentStatus: {
          type: String,
          enum: ['not_required', 'pending', 'verified', 'rejected'],
          default: 'not_required',
        },
        receiptId: { type: mongoose.Schema.Types.ObjectId, ref: 'Receipt' },
        // For external participants without accounts
        externalName: { type: String },
        externalEmail: { type: String },
      },
    ],
    tags: [{ type: String }],
    rejectionReason: { type: String, default: '' },
    // Registration deadline — optional; triggers "closing soon" notification 24h before
    registrationDeadline: { type: Date },
  },
  { timestamps: true }
);

// Generate event code when external access is enabled
EventSchema.pre('save', async function () {
  if (this.allowExternal && !this.eventCode) {
    this.eventCode = randomUUID().split('-')[0].toUpperCase();
  }
});

module.exports = mongoose.model('Event', EventSchema);
