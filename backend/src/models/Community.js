import mongoose from 'mongoose';

const communitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    president: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['Active', 'Pending'],
      default: 'Active'
    },
    memberCount: {
      type: Number,
      default: 0,
      min: 0
    },
    eventCount: {
      type: Number,
      default: 0,
      min: 0
    },
    imageUrl: {
      type: String,
      trim: true,
      default: ''
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

export const Community =
  mongoose.models.Community || mongoose.model('Community', communitySchema);
