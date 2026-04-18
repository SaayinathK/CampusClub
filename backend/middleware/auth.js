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

    try {
        const tokenSecret = process.env.JWT_SECRET || 'supersecretkey';
        const decoded = jwt.verify(token, tokenSecret);

        const dbUser = await User.findById(decoded.id).select('_id role status tokenVersion').lean();
        if (!dbUser) return res.status(401).json({ message: 'Token is not valid' });

        const tokenVersion = decoded.tokenVersion || 0;
        const userTokenVersion = dbUser.tokenVersion || 0;
        if (tokenVersion !== userTokenVersion) {
            return res.status(401).json({ message: 'Token is not valid' });
        }

        const normalizedRole = ROLE_MAP[decoded.role] || decoded.role;
        req.user = { id: decoded.id, role: normalizedRole };
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token is not valid' });
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