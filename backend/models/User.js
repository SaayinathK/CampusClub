const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['admin', 'community_admin', 'student', 'external'],
        default: 'external',
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    itNumber: {
        type: String,
        trim: true,
    },
    // Community admin registration fields (stored at signup, used when admin approves)
    communityName: { type: String, trim: true },
    communityDescription: { type: String, trim: true },
    communityCategory: { type: String, trim: true },

    // --- Community Admin link (1-to-1 with Community.admin) ---
    // Set when the admin approves the community_admin account.
    managedCommunity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Community',
    },

    // --- Student links ---
    // Community the student selected at signup (used by CA to see pending account requests).
    // Cleared after the student is approved and enrolled.
    requestedCommunity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Community',
    },
    // Approved community memberships — mirrors Community.members[].user for this student.
    // Each entry tracks which community the student belongs to, their role inside it, and when they joined.
    communities: [
        {
            community: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Community',
                required: true,
            },
            role: {
                type: String,
                enum: ['member', 'moderator'],
                default: 'member',
            },
            joinedAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],

    // Approval tracking
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    approvedAt: { type: Date },
    rejectionReason: { type: String },
}, { timestamps: true });

// Fast lookup: find all pending students for a community (GET /users/community/:id/pending-students)
userSchema.index({ requestedCommunity: 1, role: 1, status: 1 });
// Fast lookup: community admin by managed community
userSchema.index({ managedCommunity: 1 });

module.exports = mongoose.model('User', userSchema);
