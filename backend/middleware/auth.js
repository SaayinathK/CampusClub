// auth.js
const jwt = require('jsonwebtoken');

// Legacy role mapping for old tokens
const ROLE_MAP = { community: 'community_admin', sliit: 'student' };

/**
 * Middleware: Protect routes & verify JWT token
 * - Decodes token
 * - Normalizes legacy roles
 * - Fetches user from DB if needed
 * - Attaches minimal user info to req.user
 */
const protect = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
        const tokenSecret = process.env.JWT_SECRET || 'supersecretkey';
        const decoded = jwt.verify(token, tokenSecret);

        // Trust the signed JWT — no DB lookup needed on every request.
        // The token carries id + role, both set at login time and signed with the secret.
        // This means no DB dependency per request, so nodemon restarts / DB hiccups
        // never invalidate an otherwise valid session.
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