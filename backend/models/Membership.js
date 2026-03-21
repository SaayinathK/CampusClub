const mongoose = require('mongoose');

// Membership tracks the lifecycle of a student's join request for a community.
// Status flow: pending → approved | rejected
// When approved: the user is also added to Community.members and User.communities.
const MembershipSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    // Optional message from the student when requesting to join
    message: {
      type: String,
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
  },
  { timestamps: true }
);

// Prevent duplicate join requests from the same user for the same community
MembershipSchema.index({ user: 1, community: 1 }, { unique: true });

// Fast lookup: pending join requests for a community (CA dashboard)
MembershipSchema.index({ community: 1, status: 1 });

// Fast lookup: all memberships for a user (student profile / community list)
MembershipSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('Membership', MembershipSchema);
