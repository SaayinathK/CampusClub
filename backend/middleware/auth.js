// auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Legacy role mapping for old tokens
const ROLE_MAP = { community: 'community_admin', sliit: 'student' };

/**
 * Middleware: Protect routes & verify JWT token
 * - Decodes token
 * - Normalizes legacy roles
 * - Fetches user from DB if needed
 * - Attaches minimal user info to req.user
 */
const protect = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    // Verify JWT first — if invalid/expired, fail fast with 401
    let decoded;
    try {
        const tokenSecret = process.env.JWT_SECRET || 'supersecretkey';
        decoded = jwt.verify(token, tokenSecret);
    } catch (err) {
        return res.status(401).json({ message: 'Token is not valid' });
    }

    // DB lookup — separate try/catch so a DB timeout returns 503 not 401
    try {
        const user = await User.findById(decoded.id).select('-password').lean();
        if (!user) return res.status(401).json({ message: 'User not found' });

        const normalizedRole = decoded.role ? ROLE_MAP[decoded.role] || decoded.role : ROLE_MAP[user.role] || user.role;

        req.user = {
            id: user._id,
            email: user.email,
            role: normalizedRole,
        };
        next();
    } catch (err) {
        console.error('Auth DB error:', err.message);
        // DB unavailable — do NOT clear the session, return 503 so frontend keeps cached user
        return res.status(503).json({ message: 'Service temporarily unavailable' });
    }
};

/**
 * Middleware: Role-based authorization
 * Usage: authorize('admin', 'community_admin')
 */
const authorize = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied: insufficient permissions' });
    }
    next();
};

// Shortcut middleware for admin-only routes
const admin = authorize('admin');

module.exports = { protect, authorize, admin };