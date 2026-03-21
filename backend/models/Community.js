const mongoose = require('mongoose');

const CommunitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Community name is required'],
      unique: true,
      trim: true,
      maxlength: [100, 'Community name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Technology', 'Arts', 'Sports', 'Academic', 'Cultural', 'Business', 'Science', 'Social', 'Other'],
    },
    logo: {
      type: String,
      default: '',
    },
    coverImage: {
      type: String,
      default: '',
    },
    // The community admin who owns this community (1-to-1 with User.managedCommunity)
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
    // Approved members — mirrors Membership (approved) + User.communities
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        joinedAt: { type: Date, default: Date.now },
        role: { type: String, enum: ['member', 'moderator'], default: 'member' },
      },
    ],
    socialLinks: {
      facebook: { type: String },
      instagram: { type: String },
      twitter: { type: String },
      website: { type: String },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // NOTE: events are NOT stored here — query Event.find({ community: _id }) instead.
    // Storing event IDs here caused stale references when events were deleted.
  },
  { timestamps: true }
);

// memberCount as a virtual so it's always accurate regardless of how members were modified.
// Use .lean({ virtuals: true }) or toJSON/toObject with virtuals to include it in responses.
CommunitySchema.virtual('memberCount').get(function () {
  return this.members ? this.members.length : 0;
});

// Include virtuals when converting to JSON/Object (e.g. res.json())
CommunitySchema.set('toJSON', { virtuals: true });
CommunitySchema.set('toObject', { virtuals: true });

// Index for fast admin lookups (Community.findOne({ admin: req.user.id }) runs on every CA request)
CommunitySchema.index({ admin: 1 });
CommunitySchema.index({ status: 1, isActive: 1 });

module.exports = mongoose.model('Community', CommunitySchema);
