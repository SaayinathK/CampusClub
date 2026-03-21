const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Legacy role names issued in old tokens → current enum values
const ROLE_MAP = { community: 'community_admin', sliit: 'student' };

const protect = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const tokenSecret = process.env.JWT_SECRET || 'supersecretkey';
        const decoded = jwt.verify(token, tokenSecret);

        // Old tokens may not carry a role or may carry a legacy role name.
        // In that case, look it up fresh from the database.
        const rawRole = decoded.role;
        const normalizedRole = ROLE_MAP[rawRole] || rawRole;

        if (!normalizedRole) {
            // Token predates the role field — fetch the real role from DB
            const user = await User.findById(decoded.id).select('role').lean();
            if (!user) return res.status(401).json({ message: 'User not found' });
            decoded.role = ROLE_MAP[user.role] || user.role;
        } else {
            decoded.role = normalizedRole;
        }

        req.user = decoded; // { id, role, iat, exp }
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied: insufficient permissions' });
        }
        next();
    };
};

module.exports = { protect, authorize };
