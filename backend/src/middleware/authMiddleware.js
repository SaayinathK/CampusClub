import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'uniconnect-dev-secret';

async function resolveAuthenticatedUser(token) {
  const payload = jwt.verify(token, JWT_SECRET);
  return User.findById(payload.sub);
}

export async function authenticateRequest(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  if (!token) {
    return res.status(401).json({ message: 'Authentication token is missing.' });
  }

  try {
    const user = await resolveAuthenticatedUser(token);

    if (!user) {
      return res.status(401).json({ message: 'Authentication token is invalid.' });
    }

    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ message: 'Authentication token is invalid.' });
  }
}

export async function authenticateStreamRequest(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  const queryToken = String(req.query.token || '').trim();
  const token = bearerToken || queryToken;

  if (!token) {
    return res.status(401).json({ message: 'Authentication token is missing.' });
  }

  try {
    const user = await resolveAuthenticatedUser(token);

    if (!user) {
      return res.status(401).json({ message: 'Authentication token is invalid.' });
    }

    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ message: 'Authentication token is invalid.' });
  }
}

export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'You do not have permission to perform this action.'
      });
    }

    return next();
  };
}
